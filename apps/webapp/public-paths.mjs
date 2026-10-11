/**
 * Which URLs are served by the lightweight public site entry instead of the application
 * entry (`index.html`), and which of them are prerendered to static HTML at build time.
 *
 * Plain ESM (no TypeScript) because `scripts/prerender.mjs` runs it under the Docker
 * build's Node 20. Types live in `public-paths.d.mts`. Used by the Vite dev/preview
 * middleware and by the prerender step; the production nginx template
 * (`nginx.prod.conf.template`, map `$spa_entry`) must list the same paths.
 *
 * French pages live at the root, English pages under `/en`.
 */

/** @typedef {{ path: string, file: string }} PrerenderedPage */

/** @type {readonly PrerenderedPage[]} */
export const PRERENDERED_PAGES = [
  { path: '/', file: 'site-fr.html' },
  { path: '/en', file: 'site-en.html' },
];

/** @type {readonly string[]} */
export const PUBLIC_EXACT_PATHS = ['/', '/en'];
/** @type {readonly string[]} */
export const PUBLIC_PATH_PREFIXES = ['/en/'];

/** Site HTML without prerendered content, for public paths that are not prerendered. */
export const PUBLIC_SITE_FALLBACK = 'site.html';

/** @param {string} pathname */
export function isPublicSitePath(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return PUBLIC_EXACT_PATHS.includes(clean) || PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * The HTML file to serve for a public path: its prerendered page when it has one, else the bare entry.
 * @param {string} pathname
 * @returns {string | null}
 */
export function publicSiteFileFor(pathname) {
  if (!isPublicSitePath(pathname)) return null;
  const clean = pathname.replace(/\/+$/, '') || '/';
  return PRERENDERED_PAGES.find((p) => p.path === clean)?.file ?? PUBLIC_SITE_FALLBACK;
}
