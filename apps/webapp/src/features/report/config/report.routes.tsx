import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const ReportsListPage = lazy(() => import('../pages/reports-list'));

export const reportRoutes = (
  <>
    <Route path="/reports" element={<Suspense><ReportsListPage /></Suspense>} />
  </>
);
