import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const DeliverableTemplatesPage = lazy(() => import('../pages/deliverable-templates-page'));
const ReferenceDocumentsPage = lazy(() => import('../pages/reference-documents-page'));

export const adminReferenceRoutes = (
  <>
    <Route path="/admin/deliverable-templates" element={<Suspense><DeliverableTemplatesPage /></Suspense>} />
    <Route path="/admin/reference-documents" element={<Suspense><ReferenceDocumentsPage /></Suspense>} />
  </>
);
