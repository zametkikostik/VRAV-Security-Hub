# Store UX hardening (completed)

1. **adminHeaders** — Vite plugin `inject-admin-headers` patches `App.tsx` slash/publish at build/dev time.
2. **Production allowlist** — if `NODE_ENV=production` and `ADMIN_WALLETS` empty, SIWE mutations return 503.
3. **AppCard** — `downloadUrl` → external **Download**; else sandbox **Install**; `hashVerified` badge.
4. **Audit** — every mutation appends `data/audit.jsonl`; if `DATABASE_URL` set, also `vrav_audit` table (pg).

```bash
git pull && npm i && npm run dev
```
