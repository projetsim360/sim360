import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const DebriefingPage = lazy(() => import('../pages/debriefing-page'));
const PortfolioPage = lazy(() => import('../pages/portfolio-page'));
const PortfolioListPage = lazy(() => import('../pages/portfolio-list-page'));
const CvSuggestionsPage = lazy(() => import('../pages/cv-suggestions-page'));
const BadgesPage = lazy(() => import('../pages/badges-page'));
const BadgeDetailPage = lazy(() => import('../pages/badge-detail-page'));

export const valorizationRoutes = (
  <>
    <Route path="/valorization/portfolio" element={<Suspense><PortfolioListPage /></Suspense>} />
    <Route path="/simulations/:id/debriefing" element={<Suspense><DebriefingPage /></Suspense>} />
    <Route path="/simulations/:id/portfolio" element={<Suspense><PortfolioPage /></Suspense>} />
    <Route path="/simulations/:id/cv-suggestions" element={<Suspense><CvSuggestionsPage /></Suspense>} />
    <Route path="/profile/badges" element={<Suspense><BadgesPage /></Suspense>} />
    <Route path="/profile/badges/:badgeId" element={<Suspense><BadgeDetailPage /></Suspense>} />
  </>
);

// Public route (no auth, no layout) — register separately
const BadgeVerifyPage = lazy(() => import('../pages/badge-verify-page'));

export const badgeVerifyRoute = (
  <Route path="/badges/:badgeId/verify" element={<Suspense><BadgeVerifyPage /></Suspense>} />
);
