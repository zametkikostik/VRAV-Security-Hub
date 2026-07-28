# VRAV Security Hub — status

## Implemented (phases 1–6 + store UX)

| Area | Status |
|------|--------|
| Hardened Express (helmet, rate limit, Zod, multer hash scan) | Done |
| VirusTotal by file hash | Done |
| Gemini audit API | Done |
| RainbowKit + wagmi | Done |
| SIWE JWT sessions | Done |
| GitHub releases catalog + import | Done |
| Client SHA-256 verified import | Done |
| Store cards external Download + hashVerified | Done |
| Audit log JSONL (+ optional Postgres) | Done |
| Production ADMIN_WALLETS enforce | Done |
| On-chain slash contract + UI path | Done |
| Soft store refresh event | Done |
| APK structure verifier + CI smoke | Done |
| In-app Operator Setup for API keys | Done |

## Remaining (not bugs — product roadmap)

| Item | Why |
|------|-----|
| Postgres as primary app DB | Still `manifest.json` |
| Real IPFS publish from UI | Scripts only |
| APK apksigner in CI with real APK artifact | Needs build artifact |
| iOS distribution | Not viable as generic IPA store |
| Split `App.tsx` monolith | DX debt |
| Deployed slash contract address | You deploy + paste |
| WalletConnect real project id | You create at cloud.walletconnect.com |

## Known limitations (by design)

- Not a binary CDN / auto-install mall
- Metadata SHA without real file hash → unverified listing
- Runtime operator keys reset on server restart unless in `.env`
