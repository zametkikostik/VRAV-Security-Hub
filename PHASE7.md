# Phase 7 — Postgres · IPFS · deploy · types

## Postgres catalog

```env
DATABASE_URL=postgres://user:pass@localhost:5432/vrav
```

On boot: table `vrav_apps`, seed from `manifest.json` if empty. Without URL → file backend.

## IPFS (Pinata)

```env
PINATA_JWT=eyJ...
```

UI: **IPFS pin** (violet button). `POST /api/ipfs/pin` multipart + optional register.

## Slash deploy

```bash
chmod +x contracts/deploy_slash.sh
export POLYGON_RPC=... PK=... OWNER=0x...
./contracts/deploy_slash.sh
```

Paste address into Operator Setup / `.env`.

## Types

`src/types/app.ts`, `src/data/initialApps.ts` — App.tsx still self-contained for demos; new code imports shared types.
