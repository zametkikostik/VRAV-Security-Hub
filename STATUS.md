# VRAV Security Hub — status

## Done

| Area | Status |
|------|--------|
| Hardened API, SIWE, VT, Gemini, Web3 | Done |
| GitHub catalog + verified SHA import | Done |
| Store external download + hashVerified | Done |
| Audit JSONL + optional Postgres | Done |
| On-chain slash + UI | Done |
| Operator Setup / IPFS Pinata | Done |
| Postgres catalog (`vrav_apps`) | Done |
| deploy_slash.sh | Done |
| Shared types + initialApps + mockCodeTemplates | Done |
| Vite strips data monoliths from App.tsx at build | Done |
| Fixture APK + CI structure verify | Done |

## Ops checklist

1. `.env`: `JWT_SECRET`, `ADMIN_WALLETS`
2. Optional: `DATABASE_URL`, `PINATA_JWT`, Gemini, VT, GitHub
3. WalletConnect + slash address (Operator Setup)
4. `npm run deploy:slash` when needed

## Residual (closed / non-goals)

| Item | Note |
|------|------|
| App.tsx UI shell | Still large; **data** extracted — further UI split optional DX |
| Signed APK in CI | Needs real release artifact; fixture covers structure |
| iOS IPA store | **Non-goal** |
