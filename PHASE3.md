# Phase 3 — SIWE auth for mutations

## Flow

1. Connect wallet (Phase 2 ConnectButton).
2. Click **Sign in with Ethereum** → nonce → SIWE message → signature → JWT.
3. `adminHeaders()` sends `Authorization: Bearer <jwt>` on publish/slash/scan-file.
4. Server verifies JWT; optional `ADMIN_WALLETS` allowlist.
5. Legacy `X-Admin-Token` still works for CI/scripts.

## Env

```env
JWT_SECRET=long-random-secret
ADMIN_WALLETS=0xYourAdminWallet
# ADMIN_API_TOKEN optional break-glass
```

## API

- `GET /api/auth/nonce?address=0x...`
- `POST /api/auth/verify` `{ message, signature }` → `{ token, address }`
- `GET /api/auth/me` (Bearer) → `{ address }`

## App.tsx

Ensure publish/slash use `adminHeaders()` from `src/lib/adminHeaders.ts` (see PHASE1.md).

## Next (Phase 4)

GitHub releases catalog + APK download links + mandatory hash/VT (no auto-install malware vector).
