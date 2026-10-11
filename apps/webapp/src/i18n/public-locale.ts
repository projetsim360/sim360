/**
 * Locale handling for the PUBLIC pages (landing, footer pages, catalogue, demo).
 *
 * French is the default and lives at the root (`/`). English lives under `/en`.
 * The signed-in application is not covered here: it follows `User.language` and
 * gets its own provider in a later iteration.
 *
 * Pure functions, no React: imported by components and by unit tests alike.
 */

export type PublicLocale = 'fr' | 'en';

export const PUBLIC_LOCALES: readonly PublicLocale[] = ['fr', 'en'];
export const DEFAULT_PUBLIC_LOCALE: PublicLocale = 'fr';
export const EN_PREFIX = '/en';

/** BCP 47 tag used for number and date formatting (Canadian French and English). */
export function intlLocale(locale: PublicLocale): 'fr-CA' | 'en-CA' {
  return locale === 'en' ? 'en-CA' : 'fr-CA';
}

/** `/en` and `/en/...` are English; everything else is French. */
export function localeFromPathname(pathname: string): PublicLocale {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'fr';
}

/** `/en/contact` → `/contact`, `/en` → `/`, `/contact` → `/contact`. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

/** Public path for a locale: `localizedPath('/contact', 'en')` → `/en/contact`, `('/', 'en')` → `/en`. */
export function localizedPath(path: string, locale: PublicLocale): string {
  const bare = stripLocalePrefix(path.startsWith('/') ? path : `/${path}`);
  if (locale === 'fr') return bare;
  return bare === '/' ? EN_PREFIX : `${EN_PREFIX}${bare}`;
}

/** The other public locale, for the language switcher. */
export function alternateLocale(locale: PublicLocale): PublicLocale {
  return locale === 'fr' ? 'en' : 'fr';
}
