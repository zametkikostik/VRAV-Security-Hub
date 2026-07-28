import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, polygon, polygonAmoy, sepolia } from 'wagmi/chains';

function resolveProjectId(): string {
  try {
    const ls = localStorage.getItem('vrav_wc_project_id');
    if (ls && ls.length >= 32) return ls;
  } catch {
    /* ignore */
  }
  return (
    (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ||
    '00000000000000000000000000000000'
  );
}

const projectId = resolveProjectId();

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
