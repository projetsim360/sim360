import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { PublicShell } from '../components/public-shell';

const LandingPage = lazy(() => import('../pages/landing-page'));

/**
 * Public routes. French at the root, English under `/en` (roadmap decision D4).
 * Footer pages (lot 4) register here as children of both shells.
 */
export const landingRoutes = (
  <>
    <Route path="/" element={<PublicShell locale="fr" />}>
      <Route index element={<Suspense><LandingPage /></Suspense>} />
    </Route>
    <Route path="/en" element={<PublicShell locale="en" />}>
      <Route index element={<Suspense><LandingPage /></Suspense>} />
    </Route>
  </>
);
