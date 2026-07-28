import { useWriteContract } from 'wagmi';
import { slashAppFull } from '../lib/slashOnChain';
import { slashContractConfigured } from '../lib/slashContract';

export function useSlashApp() {
  const { writeContractAsync, isPending } = useWriteContract();

  const slash = async (appId: string) => {
    return slashAppFull({
      appId,
      writeContractAsync: slashContractConfigured()
        ? (writeContractAsync as any)
        : undefined,
    });
  };

  return {
    slash,
    isPending,
    onChainEnabled: slashContractConfigured(),
  };
}
