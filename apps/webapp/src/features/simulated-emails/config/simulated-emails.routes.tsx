import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const EmailInboxPage = lazy(() => import('../pages/email-inbox-page'));
const EmailDetailPage = lazy(() => import('../pages/email-detail-page'));
const CompanyIntranetPage = lazy(() => import('../pages/company-intranet-page'));

export const simulatedEmailRoutes = (
  <>
    <Route
      path="/emails/:folder"
      element={
        <Suspense>
          <EmailInboxPage />
        </Suspense>
      }
    />
    {/* Legacy route for direct simulation email access */}
    <Route
      path="/simulations/:id/emails"
      element={
        <Suspense>
          <EmailInboxPage />
        </Suspense>
      }
    />
    <Route
      path="/simulations/:id/emails/:emailId"
      element={
        <Suspense>
          <EmailDetailPage />
        </Suspense>
      }
    />
    <Route
      path="/simulations/:id/intranet"
      element={
        <Suspense>
          <CompanyIntranetPage />
        </Suspense>
      }
    />
  </>
);
