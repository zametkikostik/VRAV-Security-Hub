# VRAV Security Hub — status

## Done

| Area | Status |
|------|--------|
| Hardened API, SIWE, VT, Gemini, Web3 | Done |
| GitHub catalog + verified SHA import | Done |
| Store external download + hashVerified | Done |
| Audit JSONL + optional Postgres audit | Done |
| On-chain slash contract + UI wiring | Done |
| Soft refresh, APK structure CI | Done |
| In-app Operator Setup | Done |
| **Postgres primary catalog (`vrav_apps`)** | Done (opt-in DATABASE_URL) |
| **Pinata IPFS pin from UI** | Done (PINATA_JWT) |
| **deploy_slash.sh** | Done |
| **Shared types / initialApps extract** | Done |

## Your ops checklist

1. `.env`: JWT_SECRET, ADMIN_WALLETS
2. Optional: DATABASE_URL, PINATA_JWT, GEMINI, VT, GITHUB_TOKEN
3. WalletConnect project id (Operator Setup or VITE_)
4. `npm run deploy:slash` → paste address

## Residual debt

- Full split of 125KB `App.tsx` (types extracted; UI still in App)
- Real apksigner needs a checked-in or built APK artifact in CI
- iOS sideload store still not a product goal
