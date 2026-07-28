import type { Express, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import crypto from 'node:crypto';

type Deps = {
  requireAuth: (req: Request, res: Response, next: () => void) => void | Promise<void>;
  mutateLimiter: any;
  upsertApp: (app: any) => Promise<any[]>;
  checkVirusTotalHash: (hash: string) => Promise<string>;
  sha256Hex: (buf: Buffer | string) => string;
};

function pinataJwt(): string {
  return process.env.PINATA_JWT || process.env.IPFS_PINATA_API_KEY || '';
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 },
});

export function registerIpfsRoutes(app: Express, deps: Deps) {
  const { requireAuth, mutateLimiter, upsertApp, checkVirusTotalHash, sha256Hex } = deps;

  app.get('/api/ipfs/status', (_req, res) => {
    res.json({
      pinataConfigured: Boolean(pinataJwt()),
      note: 'Set PINATA_JWT for real IPFS pin via Pinata API',
    });
  });

  /**
   * Auth: pin a package to IPFS via Pinata (or reject if not configured).
   * Does not host the file on VRAV after response — only returns CID + optional registry row.
   */
  app.post(
    '/api/ipfs/pin',
    mutateLimiter,
    requireAuth as any,
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
        const jwt = pinataJwt();
        if (!jwt) {
          res.status(503).json({
            error: 'PINATA_JWT not configured. Add it in .env or operator setup.',
          });
          return;
        }
        if (!req.file?.buffer) {
          res.status(400).json({ error: 'file field required (multipart)' });
          return;
        }

        const meta = z
          .object({
            id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9._-]+$/).optional(),
            name: z.string().max(200).optional(),
            version: z.string().max(64).optional(),
            developer: z.string().max(200).optional(),
            description: z.string().max(4000).optional(),
            category: z.string().max(64).optional(),
            register: z
              .union([z.literal('true'), z.literal('false'), z.boolean()])
              .optional(),
          })
          .safeParse({
            id: req.body?.id,
            name: req.body?.name,
            version: req.body?.version,
            developer: req.body?.developer,
            description: req.body?.description,
            category: req.body?.category,
            register: req.body?.register,
          });

        if (!meta.success) {
          res.status(400).json({ error: 'Invalid metadata', details: meta.error.flatten() });
          return;
        }

        const hash = sha256Hex(req.file.buffer);
        const vt = await checkVirusTotalHash(hash);

        const form = new FormData();
        const blob = new Blob([req.file.buffer], {
          type: req.file.mimetype || 'application/octet-stream',
        });
        form.append('file', blob, req.file.originalname || 'package.bin');

        const pinRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: { Authorization: `Bearer ${jwt}` },
          body: form as any,
        });

        if (!pinRes.ok) {
          const t = await pinRes.text();
          res.status(pinRes.status).json({
            error: `Pinata error ${pinRes.status}`,
            detail: t.slice(0, 400),
          });
          return;
        }

        const pinned: any = await pinRes.json();
        const cid = pinned.IpfsHash || pinned.cid || pinned.Hash;
        if (!cid) {
          res.status(502).json({ error: 'Pinata response missing CID', raw: pinned });
          return;
        }

        const register =
          meta.data.register === true || meta.data.register === 'true';

        let appRecord: any = null;
        if (register && meta.data.id) {
          const malicious = /malicious/i.test(vt);
          appRecord = {
            id: meta.data.id,
            name: meta.data.name || meta.data.id,
            version: meta.data.version || '1.0.0',
            developer: meta.data.developer || 'Publisher',
            description:
              meta.data.description ||
              `IPFS package ${req.file.originalname}. CID ${cid}.`,
            category: meta.data.category || 'Utilities',
            ipfsHash: cid,
            sha256: hash,
            hashVerified: true,
            source: 'ipfs',
            reputationStaked: 0,
            authorizerSignature: `0x${sha256Hex('ipfs-sig:' + meta.data.id).slice(0, 64)}`,
            virustotalScore: vt,
            permissionsCount: 0,
            staticScanStatus: malicious ? 'critical' : 'clean',
            trustScore: malicious ? 5 : 80,
            stakingAddress: (req as any).authAddress?.startsWith?.('0x')
              ? (req as any).authAddress
              : `0x${sha256Hex('ipfs-addr:' + meta.data.id).slice(0, 40)}`,
            isSlashed: malicious,
            installCount: 0,
            downloadUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
          };
          await upsertApp(appRecord);
        }

        res.json({
          success: true,
          cid,
          sha256: hash,
          virustotalScore: vt,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
          app: appRecord,
          note: 'Pinned via Pinata. VRAV does not re-host the binary.',
        });
      } catch (err: any) {
        res.status(500).json({ error: err.message || 'IPFS pin failed' });
      }
    }
  );
}
