# Configure VRAV yourself

## Option A — UI (fastest)

1. `npm i && npm run dev`
2. Connect wallet → **Sign in with Ethereum**
3. Bottom-right **API & keys setup**:
   - **Client:** WalletConnect Project ID, slash contract `0x…`, optional admin token
   - **Server:** Gemini, VirusTotal, GitHub token (sent only to your backend after SIWE)
4. Reload once after client WalletConnect change

Server keys from UI live until process restart. For permanence use Option B.

## Option B — `.env` (recommended for production)

```bash
cp .env.example .env
```

| Variable | Where | Purpose |
|----------|--------|--------|
| `JWT_SECRET` | server | SIWE sessions (long random, required prod) |
| `ADMIN_WALLETS` | server | `0xabc...,0xdef...` operators |
| `ADMIN_API_TOKEN` | server | CI / fallback auth |
| `GEMINI_API_KEY` | server | AI audit |
| `VIRUSTOTAL_API_KEY` | server | Hash lookup |
| `GITHUB_TOKEN` | server | Releases rate limit |
| `GITHUB_CATALOG_PRESETS` | server | `owner/repo,...` |
| `VITE_WALLETCONNECT_PROJECT_ID` | frontend build | WC cloud |
| `VITE_SLASH_CONTRACT_ADDRESS` | frontend build | On-chain slash |
| `VITE_ADMIN_API_TOKEN` | frontend build | Only if no SIWE; avoid in public prod |
| `DATABASE_URL` | server | Optional Postgres audit |
| `ALLOW_REMOTE_HASH` | server | Keep `false` |

Restart after editing `.env`.

## Security rules baked in

- Gemini / VT / GitHub secrets **never** returned by GET APIs
- Production: empty `ADMIN_WALLETS` blocks SIWE mutations
- Production: default JWT secret rejects SIWE verify
- No APK hosting; external GitHub download only
