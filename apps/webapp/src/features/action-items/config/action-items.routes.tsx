import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const ActionItemsPage = lazy(() => import('../pages/action-items-page'));

export const actionItemsRoutes = (
  <>
    <Route path="/simulations/:id/actions" element={<Suspense><ActionItemsPage /></Suspense>} />
  </>
);
