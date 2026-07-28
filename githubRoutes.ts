import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'node:crypto';

type Deps = {
  requireAuth: (req: Request, res: Response, next: () => void) => void | Promise<void>;
  mutateLimiter: any;
  checkVirusTotalHash: (hash: string) => Promise<string>;
  readManifest: () => Promise<any[]>;
  writeManifestAtomic: (apps: any[]) => Promise<void>;
  sha256Hex: (buf: Buffer | string) => string;
};

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'VRAV-Security-Hub',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function isPackageAsset(name: string): boolean {
  return /\.(apk|aab|ipa|zip|jar)$/i.test(name);
}

export function registerGithubRoutes(app: Express, deps: Deps) {
  const {
    requireAuth,
    mutateLimiter,
    checkVirusTotalHash,
    readManifest,
    writeManifestAtomic,
    sha256Hex,
  } = deps;

  /** Public: list releases for owner/repo */
  app.get('/api/github/releases', async (req, res) => {
    try {
      const owner = String(req.query.owner || '').trim();
      const repo = String(req.query.repo || '').trim();
      if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
        res.status(400).json({ error: 'owner and repo required (alphanumeric)' });
        return;
      }
      const perPage = Math.min(Number(req.query.per_page) || 10, 30);
      const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${perPage}`;
      const gh = await fetch(url, { headers: ghHeaders() });
      if (!gh.ok) {
        const t = await gh.text();
        res.status(gh.status).json({
          error: `GitHub API ${gh.status}`,
          detail: t.slice(0, 300),
        });
        return;
      }
      const releases = (await gh.json()) as any[];
      const mapped = releases.map((r) => ({
        id: r.id,
        tag: r.tag_name,
        name: r.name || r.tag_name,
        draft: r.draft,
        prerelease: r.prerelease,
        publishedAt: r.published_at,
        htmlUrl: r.html_url,
        body: typeof r.body === 'string' ? r.body.slice(0, 2000) : '',
        assets: (r.assets || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          size: a.size,
          contentType: a.content_type,
          downloadUrl: a.browser_download_url,
          isPackage: isPackageAsset(a.name),
        })),
      }));
      res.json({
        owner,
        repo,
        repoUrl: `https://github.com/${owner}/${repo}`,
        releases: mapped,
        note: 'Links are external GitHub downloads. VRAV does not host or auto-install binaries.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'GitHub proxy failed' });
    }
  });

  /** Curated presets from env GITHUB_CATALOG_PRESETS=owner/repo,owner2/repo2 */
  app.get('/api/catalog/github-presets', (_req, res) => {
    const raw = process.env.GITHUB_CATALOG_PRESETS || '';
    const presets = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [owner, repo] = pair.split('/');
        return owner && repo ? { owner, repo } : null;
      })
      .filter(Boolean);
    res.json({
      presets:
        presets.length > 0
          ? presets
          : [
              { owner: 'zametkikostik', repo: 'VRAV-Security-Hub' },
            ],
    });
  });

  /**
   * Auth: import a GitHub release asset into manifest as catalog entry.
   * Does NOT download the full binary to serve users — only metadata + optional client-provided sha256 + VT-by-hash.
   * downloadUrl points to GitHub; install remains user-initiated off-platform.
   */
  app.post('/api/catalog/import-github', mutateLimiter, requireAuth, async (req, res) => {
    try {
      const body = z
        .object({
          owner: z.string().min(1).max(64),
          repo: z.string().min(1).max(64),
          tag: z.string().min(1).max(128),
          assetName: z.string().min(1).max(256),
          downloadUrl: z.string().url().max(2000),
          sha256: z
            .string()
            .regex(/^[a-fA-F0-9]{64}$/)
            .optional(),
          name: z.string().max(200).optional(),
          description: z.string().max(4000).optional(),
          category: z.string().max(64).optional(),
        })
        .safeParse(req.body);

      if (!body.success) {
        res.status(400).json({ error: 'Validation failed', details: body.error.flatten() });
        return;
      }

      const b = body.data;
      if (!b.downloadUrl.includes('github.com') && !b.downloadUrl.includes('githubusercontent.com')) {
        res.status(400).json({
          error: 'downloadUrl must be a GitHub release asset URL',
        });
        return;
      }

      if (!isPackageAsset(b.assetName) && !/\.(apk|aab|ipa|zip)$/i.test(b.downloadUrl)) {
        res.status(400).json({
          error: 'Only package-like assets (.apk/.aab/.ipa/.zip) can be imported',
        });
        return;
      }

      let sha = b.sha256;
      if (!sha) {
        // Deterministic metadata hash — not a substitute for real file hash
        sha = sha256Hex(`gh:${b.owner}/${b.repo}:${b.tag}:${b.assetName}:${b.downloadUrl}`);
      }

      const vt = await checkVirusTotalHash(sha);
      const malicious = /malicious/i.test(vt);
      const id = `gh-${b.owner}-${b.repo}-${b.tag}`
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .slice(0, 120);

      const apps = await readManifest();
      const idx = apps.findIndex((a: any) => a.id === id);

      const record = {
        id,
        name: b.name || `${b.repo} ${b.tag}`,
        version: b.tag.replace(/^v/i, '') || '0.0.0',
        developer: b.owner,
        description:
          b.description ||
          `GitHub release asset ${b.assetName} from ${b.owner}/${b.repo}. External download only — not hosted by VRAV.`,
        category: b.category || 'GitHub',
        ipfsHash: `github:${b.owner}/${b.repo}@${b.tag}`,
        sha256: sha,
        reputationStaked: 0,
        authorizerSignature: `0x${sha256Hex('gh-sig:' + id).slice(0, 64)}`,
        virustotalScore: vt,
        permissionsCount: 0,
        staticScanStatus: malicious ? 'critical' : /suspicious/i.test(vt) ? 'warning' : 'clean',
        trustScore: malicious ? 5 : /unknown|skipped|error/i.test(vt) ? 50 : 80,
        stakingAddress:
          (req as any).authAddress?.startsWith?.('0x')
            ? (req as any).authAddress
            : `0x${sha256Hex('gh-addr:' + id).slice(0, 40)}`,
        isSlashed: malicious,
        installCount: idx >= 0 ? apps[idx].installCount || 0 : 0,
        // Phase 4 fields
        source: 'github',
        downloadUrl: b.downloadUrl,
        githubOwner: b.owner,
        githubRepo: b.repo,
        githubTag: b.tag,
        githubAsset: b.assetName,
      };

      if (idx >= 0) apps[idx] = record;
      else apps.push(record);
      await writeManifestAtomic(apps);

      res.json({
        success: true,
        app: record,
        securityNote:
          'Catalog entry only. Users must download from GitHub themselves. Provide real SHA-256 of the asset for accurate VT results.',
        actor: (req as any).authAddress,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Import failed' });
    }
  });

  /** Hash a remote URL server-side only if size small — disabled by default for safety */
  app.post('/api/catalog/hash-url', mutateLimiter, requireAuth, async (req, res) => {
    try {
      if (process.env.ALLOW_REMOTE_HASH !== 'true') {
        res.status(403).json({
          error:
            'Remote hash disabled. Set ALLOW_REMOTE_HASH=true to enable (max 32MB). Prefer client-side hash.',
        });
        return;
      }
      const url = z.string().url().parse(req.body?.url);
      if (!url.includes('github.com') && !url.includes('githubusercontent.com')) {
        res.status(400).json({ error: 'Only GitHub URLs allowed' });
        return;
      }
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 60_000);
      const r = await fetch(url, {
        signal: ctrl.signal,
        headers: ghHeaders(),
        redirect: 'follow',
      });
      clearTimeout(timer);
      if (!r.ok) {
        res.status(r.status).json({ error: `Fetch failed ${r.status}` });
        return;
      }
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 32 * 1024 * 1024) {
        res.status(413).json({ error: 'File too large (>32MB)' });
        return;
      }
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      const vt = await checkVirusTotalHash(hash);
      res.json({ sha256: hash, size: buf.length, virustotalScore: vt });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'hash-url failed' });
    }
  });
}
