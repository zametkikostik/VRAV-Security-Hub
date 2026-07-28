# Phase 6 — On-chain slash · soft refresh · APK sig

## 1. On-chain slash

Contract: `contracts/VravReputationSlash.sol`

```bash
# Foundry example
forge create contracts/VravReputationSlash.sol:VravReputationSlash \
  --rpc-url $POLYGON_RPC \
  --private-key $PK \
  --constructor-args $YOUR_OPERATOR_ADDRESS
```

Frontend:

```env
VITE_SLASH_CONTRACT_ADDRESS=0xYourDeployedAddress
```

- `src/lib/slashOnChain.ts` — tries `writeContract` then always registry `/api/slash`
- `src/hooks/useSlashApp.ts` — React hook
- WalletBar shows **on-chain slash ON** when address configured
- Wallet must be **contract owner** for the tx to succeed; otherwise registry-only

Wire UI slash buttons to `useSlashApp().slash(id)` when refactoring App (optional); API path already works with SIWE.

## 2. Soft Store refresh

Event: `window.dispatchEvent(new CustomEvent('vrav-apps-refresh'))`

Vite inject adds listener in `App.tsx` → `GET /api/apps` without full reload.

Emitted after GitHub catalog import (phase 5).

## 3. APK signature / structure

```bash
python scripts/verify_apk_sig.py path/to/app.apk
python scripts/verify_apk_sig.py path/to/app.apk --apksigner   # if build-tools installed
python scripts/verify_apk_sig.py --smoke                      # CI
```

Checks: ZIP, AndroidManifest.xml, classes*.dex, META-INF / APK Sig Block 42 hint.

CI: smoke step in `.github/workflows/audit.yml`.
