import { type Address } from 'viem';

export const slashAbi = [
  {
    type: 'function',
    name: 'slash',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'appId', type: 'string' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isSlashed',
    stateMutability: 'view',
    inputs: [{ name: 'appId', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    type: 'event',
    name: 'Slashed',
    inputs: [
      { name: 'appIdHash', type: 'bytes32', indexed: true },
      { name: 'appId', type: 'string', indexed: false },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

export function getSlashContractAddress(): Address | null {
  let raw =
    (import.meta.env.VITE_SLASH_CONTRACT_ADDRESS as string | undefined) || '';
  try {
    const ls = localStorage.getItem('vrav_slash_contract');
    if (ls) raw = ls;
  } catch {
    /* ignore */
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) return null;
  return raw as Address;
}

export function slashContractConfigured(): boolean {
  return getSlashContractAddress() !== null;
}
