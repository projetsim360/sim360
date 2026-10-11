/**
 * Locale of the connected application (shell, auth, dashboard, features as they are converted).
 * Pure helpers, no React, so unit tests can import them.
 */
export type AppLocale = 'fr' | 'en';

export const APP_LOCALES: readonly AppLocale[] = ['fr', 'en'];
export const LOCALE_STORAGE_KEY = 'simex-locale';
/** Query parameter the public site adds to app links (`?lang=en`): localStorage is per-origin. */
export const LOCALE_QUERY_PARAM = 'lang';

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'fr' || value === 'en';
}

/**
 * Initial locale, by priority: `?lang=` in the URL (handoff from the public site), the saved
 * choice, the browser languages (English only when the first known language is English),
 * then French.
 */
export function resolveInitialLocale(input: {
  search?: string;
  stored?: string | null;
  languages?: readonly string[];
}): AppLocale {
  const fromQuery = new URLSearchParams(input.search ?? '').get(LOCALE_QUERY_PARAM);
  if (isAppLocale(fromQuery)) return fromQuery;
  if (isAppLocale(input.stored)) return input.stored;
  for (const lang of input.languages ?? []) {
    const base = lang.toLowerCase().split('-')[0];
    if (base === 'fr') return 'fr';
    if (base === 'en') return 'en';
  }
  return 'fr';
}

/** BCP 47 tag for Intl formatting: Canadian variants. */
export function appIntlLocale(locale: AppLocale): 'fr-CA' | 'en-CA' {
  return locale === 'en' ? 'en-CA' : 'fr-CA';
}
