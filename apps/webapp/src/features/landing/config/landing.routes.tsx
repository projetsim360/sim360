import { lazy, Suspense, type ComponentType } from 'react';
import { Route } from 'react-router';
import { PUBLIC_ROUTES } from '../../../../public-paths.mjs';
import type { PublicLocale, PublicRouteId } from '@/i18n/public-locale';
import { PublicShell } from '../components/public-shell';
import LandingPage from '../pages/landing-page';

/** Keeps the footer below the fold while a lazy public page loads: no layout shift. */
export function PublicPageFallback() {
  return <div className="min-h-screen" aria-busy="true" />;
}

/* One lazy component per page, created once at module load (not per render). */
const PAGES: Record<Exclude<PublicRouteId, 'home'>, ComponentType> = {
  scenarios: lazy(() => import('../pages/scenarios-page')),
  demo: lazy(() => import('../pages/demo-page')),
  about: lazy(() => import('../pages/about-page')),
  careers: lazy(() => import('../pages/careers-page')),
  contact: lazy(() => import('../pages/contact-page')),
  privacy: lazy(() => import('../pages/privacy-page')),
  terms: lazy(() => import('../pages/terms-page')),
  legal: lazy(() => import('../pages/legal-page')),
  cookies: lazy(() => import('../pages/cookies-page')),
};

/** Child routes of a locale shell: the landing at the index, each public page at its localized slug. */
function localeChildren(locale: PublicLocale) {
  const prefix = locale === 'en' ? '/en' : '';
  return (
    <>
      <Route index element={<LandingPage />} />
      {PUBLIC_ROUTES.filter((r) => r.id !== 'home').map((r) => {
        const Page = PAGES[r.id as Exclude<PublicRouteId, 'home'>];
        const slug = r[locale].slice(prefix.length + 1); // "/en/about" → "about"
        return (
          <Route
            key={r.id}
            path={slug}
            element={
              <Suspense fallback={<PublicPageFallback />}>
                <Page />
              </Suspense>
            }
          />
        );
      })}
    </>
  );
}

/**
 * Public routes. French at the root, English under `/en`, each page with its own slug per
 * language (roadmap decision D4). Slugs come from `public-paths.mjs`, shared with the dev
 * middleware, the prerender step and nginx.
 */
export const landingRoutes = (
  <>
    <Route path="/" element={<PublicShell locale="fr" />}>
      {localeChildren('fr')}
    </Route>
    <Route path="/en" element={<PublicShell locale="en" />}>
      {localeChildren('en')}
    </Route>
  </>
);
