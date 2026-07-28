/** Dev-only admin token for mutation endpoints. Replace with SIWE/Web3 in next phase. */
export function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Admin-Token': token } : {}),
    ...extra,
  };
}
