# Slash UI wiring

`handleTriggerSlash` in `App.tsx` is rewritten at build time by `vite.config.ts`:

1. `useSlashApp()` → `slashAppOnChain(appId)`
2. Tries on-chain `VravReputationSlash.slash` if `VITE_SLASH_CONTRACT_ADDRESS` set
3. Always registry `POST /api/slash` with SIWE / admin headers
4. Dispatches `vrav-apps-refresh`

Console overlay still shows the PoS daemon narrative; lines for `[CHAIN]` / registry are real.

```env
VITE_SLASH_CONTRACT_ADDRESS=0x...
```

Wallet must be **contract owner** for the transaction to succeed.
