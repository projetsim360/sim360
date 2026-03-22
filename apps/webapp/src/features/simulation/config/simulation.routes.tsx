import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const SimulationsListPage = lazy(() => import('../pages/simulations-list'));
const CreateSimulationPage = lazy(() => import('../pages/create-simulation'));
const SimulationDetailPage = lazy(() => import('../pages/simulation-detail'));
const SimulationDashboardPage = lazy(() => import('../pages/simulation-dashboard'));
const DecisionsListPage = lazy(() => import('../pages/decisions-list-page'));
const DecisionPage = lazy(() => import('../pages/decision-page'));
const EventsListPage = lazy(() => import('../pages/events-list-page'));
const TimelinePage = lazy(() => import('../pages/timeline-page'));
const RandomEventPage = lazy(() => import('../pages/random-event-page'));
const KpiHistoryPage = lazy(() => import('../pages/kpi-history-page'));
const ProjectsListPage = lazy(() => import('../pages/projects-list'));
const ProjectDetailPage = lazy(() => import('../pages/project-detail'));
const ProjectTeamPage = lazy(() => import('../pages/project-team'));
const ProjectDeliverablesPage = lazy(() => import('../pages/project-deliverables'));

export const simulationRoutes = (
  <>
    <Route path="/simulations" element={<Suspense><SimulationsListPage /></Suspense>} />
    <Route path="/simulations/new" element={<Suspense><CreateSimulationPage /></Suspense>} />
    <Route path="/simulations/:id" element={<Suspense><SimulationDetailPage /></Suspense>} />
    <Route path="/simulations/:id/dashboard" element={<Suspense><SimulationDashboardPage /></Suspense>} />
    <Route path="/simulations/:id/decisions" element={<Suspense><DecisionsListPage /></Suspense>} />
    <Route path="/simulations/:id/decisions/:decId" element={<Suspense><DecisionPage /></Suspense>} />
    <Route path="/simulations/:id/events" element={<Suspense><EventsListPage /></Suspense>} />
    <Route path="/simulations/:id/events/:evtId" element={<Suspense><RandomEventPage /></Suspense>} />
    <Route path="/simulations/:id/kpis" element={<Suspense><KpiHistoryPage /></Suspense>} />
    <Route path="/simulations/:id/timeline" element={<Suspense><TimelinePage /></Suspense>} />
    <Route path="/projects" element={<Suspense><ProjectsListPage /></Suspense>} />
    <Route path="/projects/:id" element={<Suspense><ProjectDetailPage /></Suspense>} />
    <Route path="/projects/:id/team" element={<Suspense><ProjectTeamPage /></Suspense>} />
    <Route path="/projects/:id/deliverables" element={<Suspense><ProjectDeliverablesPage /></Suspense>} />
  </>
);
