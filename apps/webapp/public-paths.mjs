/**
 * The public site: which URLs it owns (instead of the application entry `index.html`),
 * their French and English slugs, and the static HTML file each one is prerendered to.
 *
 * Plain ESM (no TypeScript) because `scripts/prerender.mjs` runs it under the Docker
 * build's Node 20. Types live in `public-paths.d.mts`. Used by the Vite dev/preview
 * middleware, the prerender step, the router and the language switcher. The production
 * nginx template (`nginx.prod.conf.template`, maps `$spa_entry`, `$bounce_apex_non_root`,
 * `$bounce_app_root`) must list the same paths.
 *
 * French pages live at the root, English pages under `/en`.
 */

/** @typedef {{ id: string, fr: string, en: string }} PublicRoute */
/** @typedef {{ path: string, file: string, locale: 'fr' | 'en', id: string }} PrerenderedPage */

/** @type {readonly PublicRoute[]} */
export const PUBLIC_ROUTES = [
  { id: 'home', fr: '/', en: '/en' },
  // Not /scenarios: that path is the application's own (authenticated) catalogue on app.simex-pro.com.
  { id: 'scenarios', fr: '/catalogue', en: '/en/catalogue' },
  { id: 'demo', fr: '/demo', en: '/en/demo' },
  { id: 'about', fr: '/a-propos', en: '/en/about' },
  { id: 'careers', fr: '/carrieres', en: '/en/careers' },
  { id: 'contact', fr: '/contact', en: '/en/contact' },
  { id: 'privacy', fr: '/confidentialite', en: '/en/privacy' },
  { id: 'terms', fr: '/cgu', en: '/en/terms' },
  { id: 'legal', fr: '/mentions-legales', en: '/en/legal' },
  { id: 'cookies', fr: '/cookies', en: '/en/cookies' },
];

/** @param {string} id @param {'fr'|'en'} locale */
function fileFor(id, locale) {
  return id === 'home' ? `site-${locale}.html` : `site-${locale}-${id}.html`;
}

/** Every public page, both languages, with its prerendered file. @type {readonly PrerenderedPage[]} */
export const PRERENDERED_PAGES = PUBLIC_ROUTES.flatMap((r) => [
  { id: r.id, locale: /** @type {'fr'} */ ('fr'), path: r.fr, file: fileFor(r.id, 'fr') },
  { id: r.id, locale: /** @type {'en'} */ ('en'), path: r.en, file: fileFor(r.id, 'en') },
]);

/** Site HTML without prerendered content, for public paths that are not prerendered. */
export const PUBLIC_SITE_FALLBACK = 'site.html';

/** @param {string} pathname */
function clean(pathname) {
  return pathname.replace(/\/+$/, '') || '/';
}

/** @param {string} pathname @returns {PublicRoute | null} */
export function publicRouteFor(pathname) {
  const p = clean(pathname);
  return PUBLIC_ROUTES.find((r) => r.fr === p || r.en === p) ?? null;
}

/** @param {string} pathname */
export function isPublicSitePath(pathname) {
  return publicRouteFor(pathname) !== null || pathname.startsWith('/en/') || clean(pathname) === '/en';
}

/**
 * The HTML file to serve for a public path: its prerendered page when it has one, else the bare entry.
 * @param {string} pathname
 * @returns {string | null}
 */
export function publicSiteFileFor(pathname) {
  if (!isPublicSitePath(pathname)) return null;
  const p = clean(pathname);
  return PRERENDERED_PAGES.find((page) => page.path === p)?.file ?? PUBLIC_SITE_FALLBACK;
}
