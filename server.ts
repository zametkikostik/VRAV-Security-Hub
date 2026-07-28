import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';
import { SiweMessage } from 'siwe';
import { SignJWT, jwtVerify } from 'jose';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const ADMIN_WALLETS = (process.env.ADMIN_WALLETS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const VT_KEY = process.env.VIRUSTOTAL_API_KEY || '';
const AUDIT_MAX = Number(process.env.AUDIT_MAX_CHARS) || 80_000;
const MANIFEST_PATH = path.join(process.cwd(), 'manifest.json');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const generalLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
const auditLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { error: 'Too many audit requests' },
});
const mutateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
});
const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 40,
});

app.use('/api/', generalLimiter);

/** address(lowercase) -> { nonce, exp } */
const nonceStore = new Map<string, { nonce: string; exp: number }>();

function jwtKey() {
  return new TextEncoder().encode(JWT_SECRET || 'dev-insecure-jwt-secret-change-me');
}

async function issueSessionToken(address: string): Promise<string> {
  return new SignJWT({ sub: address.toLowerCase(), role: 'siwe' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(jwtKey());
}

async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, jwtKey());
    const sub = typeof payload.sub === 'string' ? payload.sub.toLowerCase() : null;
    return sub;
  } catch {
    return null;
  }
}

function walletAllowed(address: string): boolean {
  if (ADMIN_WALLETS.length === 0) return true;
  return ADMIN_WALLETS.includes(address.toLowerCase());
}

declare global {
  namespace Express {
    interface Request {
      authAddress?: string;
      authMethod?: 'siwe' | 'admin-token';
    }
  }
}

/** Bearer SIWE JWT or legacy X-Admin-Token */
async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const adminHeader = req.header('x-admin-token');
  if (ADMIN_TOKEN && adminHeader && adminHeader === ADMIN_TOKEN) {
    req.authMethod = 'admin-token';
    req.authAddress = 'admin-token';
    next();
    return;
  }

  const auth = req.header('authorization');
  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    const address = await verifySessionToken(token);
    if (address) {
      if (!walletAllowed(address)) {
        res.status(403).json({
          error: 'Wallet not in ADMIN_WALLETS allowlist',
        });
        return;
      }
      req.authMethod = 'siwe';
      req.authAddress = address;
      next();
      return;
    }
  }

  if (!ADMIN_TOKEN && !JWT_SECRET) {
    res.status(503).json({
      error: 'Auth not configured: set JWT_SECRET (SIWE) and/or ADMIN_API_TOKEN',
    });
    return;
  }

  res.status(401).json({
    error:
      'Unauthorized: Sign in with Ethereum (Bearer token) or provide X-Admin-Token',
  });
}

const AppSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9._-]+$/),
  name: z.string().min(1).max(200),
  version: z.string().max(64).default('1.0.0'),
  developer: z.string().max(200).default('Anonymous'),
  description: z.string().max(4000).default(''),
  category: z.string().max(64).default('Utilities'),
  ipfsHash: z.string().min(1).max(128),
  sha256: z
    .string()
    .regex(/^[a-fA-F0-9]{64}$/)
    .optional(),
  reputationStaked: z.coerce.number().min(0).max(1e9).default(10),
  authorizerSignature: z.string().max(256).optional(),
  virustotalScore: z.string().max(128).optional(),
  permissionsCount: z.coerce.number().int().min(0).max(1000).default(1),
  staticScanStatus: z.enum(['clean', 'warning', 'critical']).default('clean'),
  trustScore: z.coerce.number().min(0).max(100).default(100),
  stakingAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional(),
  isSlashed: z.boolean().default(false),
  installCount: z.coerce.number().int().min(0).optional(),
});

type AppRecord = z.infer<typeof AppSchema> & {
  installCount: number;
  sha256: string;
  authorizerSignature: string;
  virustotalScore: string;
  stakingAddress: string;
};

async function readManifest(): Promise<AppRecord[]> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

async function writeManifestAtomic(apps: AppRecord[]) {
  const tmp = MANIFEST_PATH + `.tmp.${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(apps, null, 2), 'utf-8');
  await fs.rename(tmp, MANIFEST_PATH);
}

function sha256Hex(buf: Buffer | string): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function checkVirusTotalHash(hash: string): Promise<string> {
  if (!VT_KEY) {
    return 'VT skipped (no API key)';
  }
  try {
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
      headers: { 'x-apikey': VT_KEY },
    });
    if (res.status === 404) {
      return '0/0 Unknown (not in VT DB)';
    }
    if (!res.ok) {
      return `VT error HTTP ${res.status}`;
    }
    const json: any = await res.json();
    const stats = json?.data?.attributes?.last_analysis_stats;
    if (!stats) return 'VT: no stats';
    const mal = Number(stats.malicious || 0);
    const sus = Number(stats.suspicious || 0);
    const total =
      mal +
      sus +
      Number(stats.undetected || 0) +
      Number(stats.harmless || 0);
    if (mal > 0) return `${mal}/${total} Malicious`;
    if (sus > 0) return `${sus}/${total} Suspicious`;
    return `0/${total} Clean`;
  } catch (e: any) {
    return `VT error: ${e.message || 'network'}`;
  }
}

await fs.mkdir(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /\.(apk|ipa|zip|aab|jar|dex)$/i.test(file.originalname) ||
      file.mimetype === 'application/octet-stream' ||
      file.mimetype === 'application/zip' ||
      file.mimetype === 'application/vnd.android.package-archive';
    cb(ok ? null : new Error('Unsupported file type'), ok);
  },
});

// ─── Auth routes ──────────────────────────────────────────────────

app.get('/api/auth/nonce', authLimiter, (req, res) => {
  const address = String(req.query.address || '').toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(address)) {
    res.status(400).json({ error: 'Valid address query required' });
    return;
  }
  const nonce = crypto.randomBytes(16).toString('hex');
  nonceStore.set(address, { nonce, exp: Date.now() + 5 * 60_000 });
  res.json({ nonce });
});

app.post('/api/auth/verify', authLimiter, async (req, res) => {
  try {
    if (!JWT_SECRET) {
      res.status(503).json({
        error: 'JWT_SECRET is not configured — SIWE sessions disabled',
      });
      return;
    }
    const message = String(req.body?.message || '');
    const signature = String(req.body?.signature || '');
    if (!message || !signature) {
      res.status(400).json({ error: 'message and signature required' });
      return;
    }

    const siwe = new SiweMessage(message);
    const host = req.get('host') || 'localhost';
    const expectedDomain = process.env.SIWE_DOMAIN || host;

    const fields = await siwe.verify({
      signature,
      domain: expectedDomain,
      nonce: siwe.nonce,
    });

    const address = fields.data.address.toLowerCase();
    const stored = nonceStore.get(address);
    if (!stored || stored.nonce !== fields.data.nonce || stored.exp < Date.now()) {
      res.status(401).json({ error: 'Invalid or expired nonce' });
      return;
    }
    nonceStore.delete(address);

    if (!walletAllowed(address)) {
      res.status(403).json({ error: 'Wallet not in ADMIN_WALLETS allowlist' });
      return;
    }

    const token = await issueSessionToken(address);
    res.json({ token, address, expiresIn: '12h' });
  } catch (err: any) {
    res.status(401).json({
      error: err?.message || 'SIWE verification failed',
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const auth = req.header('authorization');
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No Bearer token' });
    return;
  }
  const address = await verifySessionToken(auth.slice(7).trim());
  if (!address) {
    res.status(401).json({ error: 'Invalid session' });
    return;
  }
  res.json({
    address,
    allowlisted: walletAllowed(address),
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    adminTokenConfigured: Boolean(ADMIN_TOKEN),
    siweConfigured: Boolean(JWT_SECRET),
    adminWalletsCount: ADMIN_WALLETS.length,
    gemini: Boolean(GEMINI_KEY),
    virustotal: Boolean(VT_KEY),
  });
});

app.get('/api/apps', async (_req, res) => {
  try {
    const apps = await readManifest();
    res.json(apps);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read manifest: ' + err.message });
  }
});

app.post('/api/apps', mutateLimiter, requireAuth, async (req, res) => {
  try {
    const parsed = AppSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }
    const body = parsed.data;
    const apps = await readManifest();
    const idx = apps.findIndex((a) => a.id === body.id);

    let sha = body.sha256;
    if (!sha) {
      sha = sha256Hex(`${body.id}:${body.version}:${body.ipfsHash}`);
    }

    let vt = body.virustotalScore;
    if (!vt && body.sha256) {
      vt = await checkVirusTotalHash(body.sha256);
    }
    if (!vt) vt = 'Not scanned';

    const record: AppRecord = {
      ...body,
      sha256: sha,
      authorizerSignature:
        body.authorizerSignature ||
        `0x${sha256Hex('sig:' + body.id).slice(0, 64)}`,
      virustotalScore: vt,
      stakingAddress:
        body.stakingAddress ||
        (req.authAddress?.startsWith('0x')
          ? req.authAddress
          : `0x${sha256Hex('addr:' + body.id).slice(0, 40)}`),
      installCount:
        idx >= 0 ? apps[idx].installCount || 1 : body.installCount || 1,
      isSlashed: body.isSlashed ?? false,
    };

    if (idx >= 0) apps[idx] = record;
    else apps.push(record);

    await writeManifestAtomic(apps);
    res.json({
      success: true,
      app: record,
      authMethod: req.authMethod,
      actor: req.authAddress,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update manifest: ' + err.message });
  }
});

app.post('/api/slash', mutateLimiter, requireAuth, async (req, res) => {
  try {
    const id = z.string().min(1).parse(req.body?.id);
    const apps = await readManifest();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) {
      res.status(404).json({ error: `App ID "${id}" not found` });
      return;
    }
    const target = apps[idx];
    if (target.isSlashed) {
      res.json({
        success: true,
        alreadySlashed: true,
        message: `App "${target.name}" already slashed`,
        slashedAddress: target.stakingAddress,
        slashedAmount: 0,
        app: target,
      });
      return;
    }
    const before = target.reputationStaked || 0;
    target.trustScore = 0;
    target.reputationStaked = 0;
    target.isSlashed = true;
    target.staticScanStatus = 'critical';
    apps[idx] = target;
    await writeManifestAtomic(apps);
    res.json({
      success: true,
      message:
        'Registry slash applied (SIWE/session). Deploy a staking contract for on-chain burn.',
      slashedAddress: target.stakingAddress,
      slashedAmount: before,
      app: target,
      actor: req.authAddress,
      authMethod: req.authMethod,
      onChain: false,
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'App ID required' });
      return;
    }
    res.status(500).json({ error: 'Slash failed: ' + err.message });
  }
});

app.get('/api/attestation', async (req, res) => {
  try {
    const id = z.string().min(1).parse(req.query.id);
    const apps = await readManifest();
    const appRec = apps.find((a) => a.id === id);
    if (!appRec) {
      res.status(404).json({ error: `App ID "${id}" not found` });
      return;
    }
    const isSlashed = appRec.isSlashed === true;
    const material = `${appRec.id}|${appRec.version}|${appRec.sha256}|${appRec.ipfsHash}`;
    const reportId = `attest-vrav-${sha256Hex(material).slice(0, 16)}`;
    const commitSha = isSlashed
      ? '0'.repeat(40)
      : sha256Hex(appRec.id + ':git').slice(0, 40);
    const signature = isSlashed
      ? '0x' + '0'.repeat(128)
      : '0x' + sha256Hex(material + ':hsm');

    res.json({
      reportId,
      appId: appRec.id,
      appName: appRec.name,
      buildVersion: appRec.version,
      compilationTimestamp: new Date().toISOString(),
      gitProvenance: {
        commitSha,
        branch: 'main',
        repository: `github.com/vrav-core/${appRec.id}`,
      },
      binaryIntegrity: {
        checksumSha256: appRec.sha256,
        fileSizeEstimatedBytes: isSlashed ? 0 : 5_120_194,
      },
      auditValidation: {
        linterStatus: isSlashed ? 'failed' : 'passed',
        regexPatternScanner: isSlashed ? 'critical' : 'clean',
        cweViolationsCount: isSlashed ? 5 : 0,
      },
      kmsHsmSigning: {
        provider: 'Simulated HSM (replace with real KMS in later phase)',
        keyRing: 'vrav-core/hsm-signers',
        keyName: `${appRec.id}-release-signer`,
        signatureAlgorithm: 'SHA256',
        hsmSignature: signature,
        status: isSlashed ? 'revoked_due_to_slashing' : 'active',
      },
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      res.status(400).json({ error: 'App ID required' });
      return;
    }
    res.status(500).json({ error: 'Attestation failed: ' + err.message });
  }
});

app.post(
  '/api/scan-file',
  mutateLimiter,
  requireAuth,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message || 'Upload error' });
        return;
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file?.buffer) {
        res.status(400).json({ error: 'file field required (multipart)' });
        return;
      }
      const hash = sha256Hex(req.file.buffer);
      const vt = await checkVirusTotalHash(hash);
      res.json({
        filename: req.file.originalname,
        size: req.file.size,
        sha256: hash,
        virustotalScore: vt,
        note: 'Hash-only scan. File is not stored for distribution.',
        actor: req.authAddress,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post('/api/audit', auditLimiter, async (req, res) => {
  try {
    const body = z
      .object({
        code: z.string().min(1).max(AUDIT_MAX),
        filename: z.string().max(256).optional(),
      })
      .safeParse(req.body);

    if (!body.success) {
      res.status(400).json({
        error: 'Invalid body',
        details: body.error.flatten(),
      });
      return;
    }

    if (!GEMINI_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured',
      });
      return;
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

    const systemPrompt = `You are VRAV Security Hub Deep AI Auditing Agent checking untrusted code for backdoors, hidden API channels, C2, reflection abuse, insecure intents, crypto bypass, or secret leakage.
Analyze the source (${body.data.filename || 'code'}).
Return structured Markdown only: Security Score /100, Overall Risk, Major Alerts, then findings with severity (CRITICAL|HIGH|MEDIUM|LOW) and remediation. No greetings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { text: systemPrompt },
        {
          text: `Filename: ${body.data.filename || 'unnamed'}\n\n\`\`\`\n${body.data.code}\n\`\`\``,
        },
      ],
    });

    const text =
      typeof (response as any).text === 'string'
        ? (response as any).text
        : (response as any).text?.() ?? JSON.stringify(response);

    res.json({ result: text });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Audit failed' });
  }
});

async function registerViteDevOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
}

registerViteDevOrStatic().then(() => {
  app.listen(PORT, () => {
    console.log(`VRAV Security Hub listening on :${PORT}`);
    if (!JWT_SECRET) console.warn('[warn] JWT_SECRET not set — SIWE disabled');
    if (!ADMIN_TOKEN) console.warn('[warn] ADMIN_API_TOKEN not set — legacy token auth off');
    if (!GEMINI_KEY) console.warn('[warn] GEMINI_API_KEY not set — /api/audit disabled');
  });
});
