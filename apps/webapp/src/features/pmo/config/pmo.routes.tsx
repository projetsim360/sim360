import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const PmoChatPage = lazy(() => import('../pages/pmo-chat-page'));

export const pmoRoutes = (
  <>
    <Route
      path="/simulations/:id/pmo"
      element={
        <Suspense>
          <PmoChatPage />
        </Suspense>
      }
    />
  </>
);
