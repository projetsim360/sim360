import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const OnboardingPage = lazy(() => import('../pages/onboarding-page'));

export const profileRoutes = (
  <>
    <Route path="/onboarding" element={<Suspense><OnboardingPage /></Suspense>} />
  </>
);
