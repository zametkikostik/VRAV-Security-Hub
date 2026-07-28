import { useCallback, useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import {
  clearSession,
  getSessionAddress,
  getSessionToken,
  signInWithEthereum,
} from '../lib/siweAuth';
import { slashContractConfigured } from '../lib/slashContract';

export function WalletBar() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const [siweAddress, setSiweAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(() => {
    const token = getSessionToken();
    const addr = getSessionAddress();
    if (token && addr) setSiweAddress(addr);
    else setSiweAddress(null);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession, address]);

  useEffect(() => {
    if (!isConnected) {
      clearSession();
      setSiweAddress(null);
    } else if (
      siweAddress &&
      address &&
      siweAddress.toLowerCase() !== address.toLowerCase()
    ) {
      clearSession();
      setSiweAddress(null);
    }
  }, [isConnected, address, siweAddress]);

  const onSignIn = async () => {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithEthereum({
        address: address as `0x${string}`,
        chainId,
        signMessageAsync,
      });
      refreshSession();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || 'SIWE failed');
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = () => {
    clearSession();
    setSiweAddress(null);
  };

  const sessionOk =
    Boolean(siweAddress) &&
    Boolean(address) &&
    siweAddress!.toLowerCase() === address!.toLowerCase();

  const onChainSlash = slashContractConfigured();

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
        <div className="pointer-events-auto flex flex-col items-end gap-1.5">
          {sessionOk ? (
            <button
              type="button"
              onClick={onSignOut}
              className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 hover:bg-emerald-900 cursor-pointer"
            >
              SIWE session · Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Signing…' : 'Sign in with Ethereum'}
            </button>
          )}
          <div className="px-2.5 py-1 rounded-lg bg-neutral-950/90 border border-slate-700 text-[10px] font-mono text-slate-400 max-w-[280px]">
            chain:{chainId} · {address.slice(0, 6)}…{address.slice(-4)}
            {onChainSlash ? ' · on-chain slash ON' : ' · registry slash only'}
          </div>
          {error && (
            <div className="px-2 py-1 rounded bg-red-950/90 border border-red-800 text-[10px] text-red-300 max-w-[260px]">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
