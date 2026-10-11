import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { localizedPath, type PublicLocale } from '@/i18n/public-locale';

/** Locale of the surrounding `PublicShell` (`fr` | `en`). */
export function usePublicLocale(): PublicLocale {
  return useIntl().locale as PublicLocale;
}

/** `to('/contact')` → `/contact` on the French site, `/en/contact` on the English one. */
export function usePublicPath() {
  const locale = usePublicLocale();
  return useCallback((path: string) => localizedPath(path, locale), [locale]);
}
