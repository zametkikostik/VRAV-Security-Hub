import { getSessionToken } from './siweAuth';

/**
 * Headers for authenticated API mutations.
 * Priority: SIWE Bearer → localStorage override → VITE_ADMIN_API_TOKEN
 */
export function adminHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const siwe = getSessionToken();
  if (siwe) {
    headers.Authorization = `Bearer ${siwe}`;
    return headers;
  }

  let token: string | undefined;
  try {
    token = localStorage.getItem('vrav_admin_token_override') || undefined;
  } catch {
    /* ignore */
  }
  if (!token) {
    token = import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;
  }
  if (token) {
    headers['X-Admin-Token'] = token;
  }
  return headers;
}
