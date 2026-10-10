/**
 * Origin serving uploaded files (`/uploads/...`), derived from VITE_API_URL.
 *
 * - Absolute API URL (`http://localhost:3001/api/v1`) → `http://localhost:3001`
 * - Relative API URL (`/api/v1`, production behind nginx) → `''` (same origin)
 * - Unset → `http://localhost:3001` (local dev default)
 */
export function getApiOrigin(apiUrl: string | undefined = import.meta.env.VITE_API_URL): string {
  if (apiUrl === undefined || apiUrl === '') return 'http://localhost:3001';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
}

/** Turns a stored asset path (e.g. `/uploads/avatars/x.png`) into a URL the browser can load. */
export function resolveAssetUrl(
  path: string | null | undefined,
  apiUrl: string | undefined = import.meta.env.VITE_API_URL,
): string | null {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return `${getApiOrigin(apiUrl)}${path.startsWith('/') ? path : `/${path}`}`;
}
