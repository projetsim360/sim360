import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const SimulationsListPage = lazy(() => import('../pages/simulations-list'));
const CreateSimulationPage = lazy(() => import('../pages/create-simulation'));
const SimulationDetailPage = lazy(() => import('../pages/simulation-detail'));
const DecisionPage = lazy(() => import('../pages/decision-page'));
const TimelinePage = lazy(() => import('../pages/timeline-page'));

export const simulationRoutes = (
  <>
    <Route path="/simulations" element={<Suspense><SimulationsListPage /></Suspense>} />
    <Route path="/simulations/new" element={<Suspense><CreateSimulationPage /></Suspense>} />
    <Route path="/simulations/:id" element={<Suspense><SimulationDetailPage /></Suspense>} />
    <Route path="/simulations/:id/decisions/:decId" element={<Suspense><DecisionPage /></Suspense>} />
    <Route path="/simulations/:id/timeline" element={<Suspense><TimelinePage /></Suspense>} />
  </>
);
