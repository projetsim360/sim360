import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { appPath, localizedPath, type PublicLocale } from '@/i18n/public-locale';

/** Locale of the surrounding `PublicShell` (`fr` | `en`). */
export function usePublicLocale(): PublicLocale {
  return useIntl().locale as PublicLocale;
}

/** `to('/contact')` → `/contact` on the French site, `/en/contact` on the English one. */
export function usePublicPath() {
  const locale = usePublicLocale();
  return useCallback((path: string) => localizedPath(path, locale), [locale]);
}

/** `appLink('/auth/sign-up')` → adds `?lang=en` on the English site (see `appPath`). */
export function useAppLink() {
  const locale = usePublicLocale();
  return (path: string) => appPath(path, locale);
}
