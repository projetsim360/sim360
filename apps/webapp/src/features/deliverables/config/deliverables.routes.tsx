import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const DeliverablesListPage = lazy(
  () => import('../pages/deliverables-list-page'),
);
const DeliverableEditorPage = lazy(
  () => import('../pages/deliverable-editor-page'),
);
const DeliverableEvaluationPage = lazy(
  () => import('../pages/deliverable-evaluation-page'),
);

export const deliverableRoutes = (
  <>
    <Route
      path="/simulations/:id/deliverables"
      element={
        <Suspense>
          <DeliverablesListPage />
        </Suspense>
      }
    />
    <Route
      path="/simulations/:id/deliverables/:delId/edit"
      element={
        <Suspense>
          <DeliverableEditorPage />
        </Suspense>
      }
    />
    <Route
      path="/simulations/:id/deliverables/:delId/evaluation"
      element={
        <Suspense>
          <DeliverableEvaluationPage />
        </Suspense>
      }
    />
  </>
);
