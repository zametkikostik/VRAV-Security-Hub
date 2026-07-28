import { createSiweMessage } from 'viem/siwe';

const SESSION_KEY = 'vrav_siwe_token';
const ADDRESS_KEY = 'vrav_siwe_address';

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function getSessionAddress(): string | null {
  try {
    return localStorage.getItem(ADDRESS_KEY);
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADDRESS_KEY);
  } catch {
    /* ignore */
  }
}

function storeSession(token: string, address: string) {
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem(ADDRESS_KEY, address.toLowerCase());
}

/**
 * SIWE login against /api/auth/* using wagmi signMessageAsync.
 */
export async function signInWithEthereum(params: {
  address: `0x${string}`;
  chainId: number;
  signMessageAsync: (args: { message: string }) => Promise<`0x${string}`>;
}): Promise<{ token: string; address: string }> {
  const { address, chainId, signMessageAsync } = params;

  const nonceRes = await fetch(
    `/api/auth/nonce?address=${encodeURIComponent(address)}`
  );
  if (!nonceRes.ok) {
    const err = await nonceRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch nonce');
  }
  const { nonce } = (await nonceRes.json()) as { nonce: string };

  const domain = window.location.host;
  const uri = window.location.origin;
  const message = createSiweMessage({
    address,
    chainId,
    domain,
    nonce,
    uri,
    version: '1',
    statement: 'Sign in to VRAV Security Hub to authorize registry mutations.',
  });

  const signature = await signMessageAsync({ message });

  const verifyRes = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, signature }),
  });
  const data = await verifyRes.json();
  if (!verifyRes.ok) {
    throw new Error(data.error || 'SIWE verification failed');
  }

  storeSession(data.token, data.address);
  return { token: data.token, address: data.address };
}
