import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { IntlProvider } from 'react-intl';
import { APP_MESSAGES } from '@/i18n/app/messages';
import {
  LOCALE_QUERY_PARAM,
  LOCALE_STORAGE_KEY,
  appIntlLocale,
  resolveInitialLocale,
  type AppLocale,
} from '@/i18n/app/locale';

interface LocaleContextValue {
  locale: AppLocale;
  /** `fr-CA` / `en-CA`, for Intl and date formatting. */
  intlLocale: 'fr-CA' | 'en-CA';
  setLocale: (locale: AppLocale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStored(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function initialLocale(): AppLocale {
  if (typeof window === 'undefined') return 'fr';
  return resolveInitialLocale({
    search: window.location.search,
    stored: readStored(),
    languages: navigator.languages ?? [navigator.language],
  });
}

/** Locale of the connected app: react-intl messages, saved choice, `<html lang>`. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);

  const setLocale = useCallback((next: AppLocale) => setLocaleState(next), []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* private mode: the choice lasts for the session */
    }
    document.documentElement.lang = locale;
  }, [locale]);

  // Drop the handoff parameter once read, so shared links do not force a language.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has(LOCALE_QUERY_PARAM)) {
      url.searchParams.delete(LOCALE_QUERY_PARAM);
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }, []);

  const value = useMemo(() => ({ locale, intlLocale: appIntlLocale(locale), setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <IntlProvider locale={appIntlLocale(locale)} messages={APP_MESSAGES[locale]} defaultLocale="fr-CA">
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useAppLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useAppLocale must be used inside LocaleProvider');
  return ctx;
}
