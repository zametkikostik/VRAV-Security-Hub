import type { Express, Request, Response } from 'express';
import { z } from 'zod';

/** Runtime overrides (never exposed to unauthenticated clients). */
export const runtimeSecrets: {
  GEMINI_API_KEY: string;
  VIRUSTOTAL_API_KEY: string;
  GITHUB_TOKEN: string;
  GITHUB_CATALOG_PRESETS: string;
} = {
  GEMINI_API_KEY: '',
  VIRUSTOTAL_API_KEY: '',
  GITHUB_TOKEN: '',
  GITHUB_CATALOG_PRESETS: '',
};

export function secret(name: keyof typeof runtimeSecrets, envFallback: string): string {
  return runtimeSecrets[name] || envFallback || '';
}

export function registerOperatorConfigRoutes(
  app: Express,
  deps: {
    requireAuth: (req: Request, res: Response, next: () => void) => void | Promise<void>;
    mutateLimiter: any;
    getStatus: () => Record<string, unknown>;
  }
) {
  const { requireAuth, mutateLimiter, getStatus } = deps;

  /** Public: only booleans / counts — no secret values */
  app.get('/api/config/status', (_req, res) => {
    res.json(getStatus());
  });

  /** Auth: which server keys are set (masked) */
  app.get('/api/operator-config', requireAuth as any, (_req, res) => {
    res.json({
      gemini: Boolean(secret('GEMINI_API_KEY', process.env.GEMINI_API_KEY || '')),
      virustotal: Boolean(secret('VIRUSTOTAL_API_KEY', process.env.VIRUSTOTAL_API_KEY || '')),
      githubToken: Boolean(secret('GITHUB_TOKEN', process.env.GITHUB_TOKEN || '')),
      githubPresets:
        secret('GITHUB_CATALOG_PRESETS', process.env.GITHUB_CATALOG_PRESETS || '') ||
        '(default)',
      note: 'Values are never returned. POST to update runtime keys (until process restart unless also in .env).',
    });
  });

  /** Auth: set runtime API keys (server memory). Does not echo secrets back. */
  app.post('/api/operator-config', mutateLimiter, requireAuth as any, (req, res) => {
    const body = z
      .object({
        GEMINI_API_KEY: z.string().max(512).optional(),
        VIRUSTOTAL_API_KEY: z.string().max(512).optional(),
        GITHUB_TOKEN: z.string().max(512).optional(),
        GITHUB_CATALOG_PRESETS: z.string().max(2000).optional(),
        clear: z
          .array(z.enum(['GEMINI_API_KEY', 'VIRUSTOTAL_API_KEY', 'GITHUB_TOKEN', 'GITHUB_CATALOG_PRESETS']))
          .optional(),
      })
      .safeParse(req.body);

    if (!body.success) {
      res.status(400).json({ error: 'Invalid body', details: body.error.flatten() });
      return;
    }

    const b = body.data;
    if (b.clear) {
      for (const k of b.clear) runtimeSecrets[k] = '';
    }
    if (typeof b.GEMINI_API_KEY === 'string' && b.GEMINI_API_KEY.length > 0) {
      runtimeSecrets.GEMINI_API_KEY = b.GEMINI_API_KEY.trim();
      process.env.GEMINI_API_KEY = runtimeSecrets.GEMINI_API_KEY;
    }
    if (typeof b.VIRUSTOTAL_API_KEY === 'string' && b.VIRUSTOTAL_API_KEY.length > 0) {
      runtimeSecrets.VIRUSTOTAL_API_KEY = b.VIRUSTOTAL_API_KEY.trim();
      process.env.VIRUSTOTAL_API_KEY = runtimeSecrets.VIRUSTOTAL_API_KEY;
    }
    if (typeof b.GITHUB_TOKEN === 'string' && b.GITHUB_TOKEN.length > 0) {
      runtimeSecrets.GITHUB_TOKEN = b.GITHUB_TOKEN.trim();
      process.env.GITHUB_TOKEN = runtimeSecrets.GITHUB_TOKEN;
    }
    if (typeof b.GITHUB_CATALOG_PRESETS === 'string') {
      runtimeSecrets.GITHUB_CATALOG_PRESETS = b.GITHUB_CATALOG_PRESETS.trim();
      process.env.GITHUB_CATALOG_PRESETS = runtimeSecrets.GITHUB_CATALOG_PRESETS;
    }

    res.json({
      success: true,
      applied: {
        gemini: Boolean(secret('GEMINI_API_KEY', process.env.GEMINI_API_KEY || '')),
        virustotal: Boolean(secret('VIRUSTOTAL_API_KEY', process.env.VIRUSTOTAL_API_KEY || '')),
        githubToken: Boolean(secret('GITHUB_TOKEN', process.env.GITHUB_TOKEN || '')),
      },
      warning:
        'Runtime keys live in process memory. Put the same values in .env for persistence across restarts.',
    });
  });
}
