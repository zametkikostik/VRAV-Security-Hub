import fs from 'node:fs/promises';
import path from 'path';
import pg from 'pg';

const MANIFEST_PATH = path.join(process.cwd(), 'manifest.json');

export type AppRecord = Record<string, unknown> & {
  id: string;
  name: string;
  version: string;
  developer: string;
  description: string;
  category: string;
  ipfsHash: string;
  sha256: string;
  reputationStaked: number;
  authorizerSignature: string;
  virustotalScore: string;
  permissionsCount: number;
  staticScanStatus: string;
  trustScore: number;
  stakingAddress: string;
  isSlashed: boolean;
  installCount: number;
};

let pool: pg.Pool | null = null;
let pgReady = false;

export function usingPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL) && pgReady;
}

export async function initAppStore(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('[appStore] file backend: manifest.json');
    return;
  }
  try {
    pool = new pg.Pool({ connectionString: url, max: 5 });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vrav_apps (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    pgReady = true;
    console.log('[appStore] postgres backend ready');
    // Seed from file if table empty
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM vrav_apps`);
    if (rows[0]?.c === 0) {
      const fileApps = await readFromFile();
      for (const app of fileApps) {
        await pool.query(
          `INSERT INTO vrav_apps (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
          [app.id, JSON.stringify(app)]
        );
      }
      if (fileApps.length) console.log(`[appStore] seeded ${fileApps.length} apps from manifest.json`);
    }
  } catch (e: any) {
    console.warn('[appStore] postgres failed, falling back to file:', e.message);
    pool = null;
    pgReady = false;
  }
}

async function readFromFile(): Promise<AppRecord[]> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeToFile(apps: AppRecord[]): Promise<void> {
  const tmp = MANIFEST_PATH + `.tmp.${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(apps, null, 2), 'utf-8');
  await fs.rename(tmp, MANIFEST_PATH);
}

export async function readApps(): Promise<AppRecord[]> {
  if (pool && pgReady) {
    const { rows } = await pool.query(`SELECT data FROM vrav_apps ORDER BY id`);
    return rows.map((r) => r.data as AppRecord);
  }
  return readFromFile();
}

export async function writeApps(apps: AppRecord[]): Promise<void> {
  if (pool && pgReady) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM vrav_apps');
      for (const app of apps) {
        await client.query(`INSERT INTO vrav_apps (id, data) VALUES ($1, $2)`, [
          app.id,
          JSON.stringify(app),
        ]);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
    // Mirror to file for backup / offline tools
    try {
      await writeToFile(apps);
    } catch {
      /* ignore mirror errors */
    }
    return;
  }
  await writeToFile(apps);
}

export async function upsertApp(app: AppRecord): Promise<AppRecord[]> {
  const apps = await readApps();
  const idx = apps.findIndex((a) => a.id === app.id);
  if (idx >= 0) apps[idx] = app;
  else apps.push(app);
  await writeApps(apps);
  return apps;
}
