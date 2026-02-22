import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const DashboardPage = lazy(() => import('../pages/dashboard'));
const TrainerDashboardPage = lazy(() => import('../pages/trainer-dashboard'));

export const dashboardRoutes = (
  <>
    <Route path="/" element={<Suspense><DashboardPage /></Suspense>} />
    <Route path="/dashboard" element={<Suspense><DashboardPage /></Suspense>} />
    <Route path="/trainer/dashboard" element={<Suspense><TrainerDashboardPage /></Suspense>} />
  </>
);
