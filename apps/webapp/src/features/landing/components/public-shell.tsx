import { Outlet, useLocation } from 'react-router';
import { IntlProvider } from 'react-intl';
import { Helmet } from 'react-helmet-async';
import { PUBLIC_MESSAGES } from '@/i18n/public-messages';
import { DEFAULT_PUBLIC_LOCALE, localizedPath, type PublicLocale } from '@/i18n/public-locale';
import { StickyNav } from './sticky-nav';
import { Footer } from './footer';

/**
 * Layout of every public page: locale-scoped IntlProvider, document head (lang, title,
 * canonical and hreflang alternates), sticky nav and footer. Forces dark mode so the
 * marketing pages ignore the signed-in user's theme preference.
 */
export function PublicShell({ locale }: { locale: PublicLocale }) {
  const { pathname } = useLocation();
  const messages = PUBLIC_MESSAGES[locale];
  // Fixed public origin: prerendered HTML has no window, and localhost must not leak into canonical URLs.
  const origin = import.meta.env.VITE_PUBLIC_ORIGIN || 'https://simex-pro.com';

  return (
    <IntlProvider locale={locale} defaultLocale={DEFAULT_PUBLIC_LOCALE} messages={messages}>
      <Helmet htmlAttributes={{ lang: locale }}>
        <title>{messages['meta.title']}</title>
        <meta name="description" content={messages['meta.description']} />
        <link rel="canonical" href={`${origin}${localizedPath(pathname, locale)}`} />
        <link rel="alternate" hrefLang="fr" href={`${origin}${localizedPath(pathname, 'fr')}`} />
        <link rel="alternate" hrefLang="en" href={`${origin}${localizedPath(pathname, 'en')}`} />
        <link rel="alternate" hrefLang="x-default" href={`${origin}${localizedPath(pathname, 'fr')}`} />
      </Helmet>
      <div className="dark min-h-screen w-full flex-1 overflow-x-hidden bg-background text-foreground">
        <StickyNav />
        <Outlet />
        <Footer />
      </div>
    </IntlProvider>
  );
}
