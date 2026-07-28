import fs from 'node:fs/promises';
import path from 'node:path';

const AUDIT_PATH = path.join(process.cwd(), 'data', 'audit.jsonl');

export type AuditEvent = {
  ts: string;
  action: string;
  actor?: string;
  method?: string;
  detail?: Record<string, unknown>;
};

export async function appendAudit(event: AuditEvent): Promise<void> {
  const line =
    JSON.stringify({
      ts: event.ts || new Date().toISOString(),
      action: event.action,
      actor: event.actor,
      method: event.method,
      detail: event.detail || {},
    }) + '\n';

  await fs.mkdir(path.dirname(AUDIT_PATH), { recursive: true });
  await fs.appendFile(AUDIT_PATH, line, 'utf-8');

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const { default: pg } = await import('pg');
      const client = new pg.Client({ connectionString: databaseUrl });
      await client.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS vrav_audit (
          id BIGSERIAL PRIMARY KEY,
          ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          action TEXT NOT NULL,
          actor TEXT,
          method TEXT,
          detail JSONB
        )
      `);
      await client.query(
        `INSERT INTO vrav_audit (ts, action, actor, method, detail) VALUES ($1, $2, $3, $4, $5)`,
        [
          event.ts || new Date().toISOString(),
          event.action,
          event.actor || null,
          event.method || null,
          JSON.stringify(event.detail || {}),
        ]
      );
      await client.end();
    } catch (err) {
      console.warn('[audit] postgres write failed:', (err as Error).message);
    }
  }
}
