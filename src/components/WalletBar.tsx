import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';

/**
 * Floating wallet chrome for Phase 2.
 * Real on-chain slash / SIWE auth lands in Phase 3.
 */
export function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <div className="fixed top-3 right-3 z-[100] flex flex-col items-end gap-2 pointer-events-none">
      <div className="pointer-events-auto shadow-lg rounded-xl">
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
      {isConnected && address && (
        <div className="pointer-events-none px-2.5 py-1 rounded-lg bg-neutral-950/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 max-w-[240px] truncate">
          chain:{chainId} · {address.slice(0, 6)}…{address.slice(-4)}
        </div>
      )}
    </div>
  );
}
