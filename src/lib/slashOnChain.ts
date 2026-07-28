import { adminHeaders } from './adminHeaders';
import { getSlashContractAddress, slashAbi } from './slashContract';

/**
 * 1) Optional on-chain slash via wallet (contract owner)
 * 2) Always registry slash via API (SIWE / admin token)
 */
export async function slashAppFull(params: {
  appId: string;
  writeContractAsync?: (args: {
    address: `0x${string}`;
    abi: typeof slashAbi;
    functionName: 'slash';
    args: [string];
  }) => Promise<`0x${string}`>;
}): Promise<{
  registry: any;
  txHash?: `0x${string}`;
  onChain: boolean;
  message: string;
}> {
  const { appId, writeContractAsync } = params;
  const address = getSlashContractAddress();
  let txHash: `0x${string}` | undefined;
  let onChain = false;

  if (address && writeContractAsync) {
    try {
      txHash = await writeContractAsync({
        address,
        abi: slashAbi,
        functionName: 'slash',
        args: [appId],
      });
      onChain = true;
    } catch (e: any) {
      // Fall through to registry-only if user rejects or not owner
      console.warn('[slash] on-chain failed:', e?.shortMessage || e?.message);
    }
  }

  const res = await fetch('/api/slash', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({
      id: appId,
      onChainTx: txHash || null,
    }),
  });
  const registry = await res.json();
  if (!res.ok) {
    throw new Error(registry.error || 'Registry slash failed');
  }

  return {
    registry,
    txHash,
    onChain,
    message: onChain
      ? `On-chain + registry slash. tx: ${txHash}`
      : 'Registry slash only (set VITE_SLASH_CONTRACT_ADDRESS + deploy as owner for on-chain).',
  };
}
