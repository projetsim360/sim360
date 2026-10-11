/**
 * Locale handling for the PUBLIC pages (landing, footer pages, catalogue, demo).
 *
 * French is the default and lives at the root (`/`). English lives under `/en`, with its
 * own slugs (`/a-propos` ↔ `/en/about`), declared once in `public-paths.mjs`.
 * The signed-in application is not covered here: it follows `User.language` and gets its
 * own provider in a later iteration.
 *
 * Pure functions, no React: imported by components and by unit tests alike.
 */
import { PUBLIC_ROUTES, publicRouteFor } from '../../public-paths.mjs';

export type PublicLocale = 'fr' | 'en';
export type PublicRouteId = (typeof PUBLIC_ROUTES)[number]['id'];

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

/** `/en/contact` → `/contact`, `/en` → `/`, `/contact` → `/contact`. Slugs are left as they are. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

/** Route id of a public path in either language, or null for unknown paths. */
export function routeIdFromPathname(pathname: string): PublicRouteId | null {
  return (publicRouteFor(pathname)?.id as PublicRouteId | undefined) ?? null;
}

/** Path of a public page in a locale: `publicPath('about', 'fr')` → `/a-propos`, `('about', 'en')` → `/en/about`. */
export function publicPath(id: PublicRouteId, locale: PublicLocale): string {
  const route = PUBLIC_ROUTES.find((r) => r.id === id);
  if (!route) throw new Error(`Unknown public route "${id}"`);
  return route[locale];
}

/**
 * Same page in another locale, translating slugs: `localizedPath('/a-propos', 'en')` → `/en/about`,
 * `('/en/about', 'fr')` → `/a-propos`. Unknown paths only gain or lose the `/en` prefix.
 */
export function localizedPath(path: string, locale: PublicLocale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const id = routeIdFromPathname(normalized);
  if (id) return publicPath(id, locale);
  const bare = stripLocalePrefix(normalized);
  if (locale === 'fr') return bare;
  return bare === '/' ? EN_PREFIX : `${EN_PREFIX}${bare}`;
}

/** The other public locale, for the language switcher. */
export function alternateLocale(locale: PublicLocale): PublicLocale {
  return locale === 'fr' ? 'en' : 'fr';
}
