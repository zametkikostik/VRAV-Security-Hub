# Phase 2 — Connect Wallet (RainbowKit + wagmi + viem)

## What landed

- Dependencies: `@rainbow-me/rainbowkit`, `wagmi`, `viem`, `@tanstack/react-query`
- `src/lib/wagmiConfig.ts` — Polygon (primary), Ethereum, Polygon Amoy, Sepolia
- `src/main.tsx` — providers + dark emerald theme
- `src/components/WalletBar.tsx` — floating **ConnectButton** (top-right)

Slash / publish still use `X-Admin-Token` until **Phase 3** (SIWE / signed mutations).

## Setup

1. Create a free project at [WalletConnect Cloud](https://cloud.walletconnect.com) and copy **Project ID**.
2. In `.env`:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

3. Reinstall and run:

```bash
npm install
npm run dev
```

4. Open the app → top-right **Connect Wallet** (MetaMask / WC / etc.).

Injected browsers wallets often work even without a Project ID; WalletConnect mobile needs a real id.

## Next (Phase 3)

- SIWE (Sign-In with Ethereum) for admin mutations
- Optional: `writeContract` slash when a staking contract address is configured
- Remove client-side `VITE_ADMIN_API_TOKEN`
