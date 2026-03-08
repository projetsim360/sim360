import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const DashboardPage = lazy(() => import('../pages/dashboard'));
const TrainerDashboardPage = lazy(() => import('../pages/trainer-dashboard'));
const TokenUsagePage = lazy(() => import('../pages/token-usage'));

export const dashboardRoutes = (
  <>
    <Route path="/dashboard" element={<Suspense><DashboardPage /></Suspense>} />
    <Route path="/trainer/dashboard" element={<Suspense><TrainerDashboardPage /></Suspense>} />
    <Route path="/ai/usage" element={<Suspense><TokenUsagePage /></Suspense>} />
  </>
);
