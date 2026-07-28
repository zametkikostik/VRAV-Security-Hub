import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, polygonAmoy, sepolia } from 'wagmi/chains';

/**
 * WalletConnect Cloud project id: https://cloud.walletconnect.com
 * Without a real id, connection to WC wallets may fail; injected wallets (MetaMask) still work.
 */
const projectId =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ||
  '00000000000000000000000000000000';

export const wagmiConfig = getDefaultConfig({
  appName: 'VRAV Security Hub',
  projectId,
  chains: [polygon, mainnet, polygonAmoy, sepolia],
  transports: {
    [polygon.id]: http(),
    [mainnet.id]: http(),
    [polygonAmoy.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: false,
});
