import { getSessionToken } from './siweAuth';

/**
 * Auth headers for mutation endpoints.
 * Preference: SIWE JWT (Bearer) → legacy VITE_ADMIN_API_TOKEN (dev break-glass).
 */
export function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const session = getSessionToken();
  const legacy = import.meta.env.VITE_ADMIN_API_TOKEN as string | undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };

  if (session) {
    headers['Authorization'] = `Bearer ${session}`;
  } else if (legacy) {
    headers['X-Admin-Token'] = legacy;
  }

  return headers;
}
