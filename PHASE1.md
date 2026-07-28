# Phase 1 — Production backend skeleton

## What landed on `main`

- Hardened `server.ts` (helmet, cors, rate-limit, Zod, atomic manifest, admin token)
- `POST /api/scan-file` — multer + SHA-256 + optional VirusTotal **by hash** (no binary distribution)
- Gemini model fixed to `gemini-2.0-flash`
- `vite.config.ts` no longer duplicates `/api/audit`
- `.env.example`, deps in `package.json`
- `src/lib/adminHeaders.ts` for frontend mutations

## Setup

```bash
cp .env.example .env
# set ADMIN_API_TOKEN, VITE_ADMIN_API_TOKEN (same value for local dev), GEMINI_API_KEY, optional VIRUSTOTAL_API_KEY
npm install
npm run dev
```

## Frontend (required for Slash / Publish UI)

In `src/App.tsx`:

1. Add import:
```ts
import { adminHeaders } from './lib/adminHeaders';
```

2. Replace slash headers:
```ts
headers: adminHeaders(),
```
instead of `{ 'Content-Type': 'application/json' }` on `POST /api/slash`.

3. Same for `POST /api/apps` in `triggerHubAppPublish`.

Without `VITE_ADMIN_API_TOKEN` matching server `ADMIN_API_TOKEN`, publish/slash return **401**.

## Next phases (queued)

2. RainbowKit + wagmi + viem (Connect Wallet)
3. On-chain / SIWE auth instead of admin token on client
4. GitHub releases catalog + APK links + mandatory hash/VT (no auto-install store)
