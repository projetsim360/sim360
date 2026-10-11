import { lazy, Suspense, type ReactNode } from 'react';
import { Route } from 'react-router';
import { PublicShell } from '../components/public-shell';
import LandingPage from '../pages/landing-page';

/** Keeps the footer below the fold while a lazy public page loads: no layout shift. */
export function PublicPageFallback() {
  return <div className="min-h-screen" aria-busy="true" />;
}

/** Lazy public page wrapped in the layout-stable fallback. */
export function lazyPublicPage(loader: () => Promise<{ default: () => ReactNode }>) {
  const Page = lazy(loader);
  return (
    <Suspense fallback={<PublicPageFallback />}>
      <Page />
    </Suspense>
  );
}

/**
 * Public routes. French at the root, English under `/en` (roadmap decision D4).
 * The landing is imported statically: it is the entry page and its chunk is small.
 * Footer pages (lot 4) register here as children of both shells with `lazyPublicPage`.
 */
export const landingRoutes = (
  <>
    <Route path="/" element={<PublicShell locale="fr" />}>
      <Route index element={<LandingPage />} />
    </Route>
    <Route path="/en" element={<PublicShell locale="en" />}>
      <Route index element={<LandingPage />} />
    </Route>
  </>
);
