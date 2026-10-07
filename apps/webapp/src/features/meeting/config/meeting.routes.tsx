import { lazy, Suspense } from 'react';
import { Route, Navigate } from 'react-router';

const MeetingsListPage = lazy(() => import('../pages/meetings-list'));
const MeetingRoomPage = lazy(() => import('../pages/meeting-room'));
const PlanMeetingPage = lazy(() => import('../pages/plan-meeting-page'));

// Les anciennes routes /live et /summary sont fusionnées dans /meetings/:meetingId.
function MeetingRedirect() {
  const m = window.location.pathname.match(/^\/meetings\/([^/]+)\/(?:live|summary)\/?$/);
  const id = m?.[1];
  if (!id) return <Navigate to="/meetings" replace />;
  return <Navigate to={`/meetings/${id}`} replace />;
}

export const meetingRoutes = (
  <>
    <Route path="/meetings" element={<Suspense><MeetingsListPage /></Suspense>} />
    <Route path="/simulations/:simId/meetings" element={<Suspense><MeetingsListPage /></Suspense>} />
    <Route path="/simulations/:simId/meetings/new" element={<Suspense><PlanMeetingPage /></Suspense>} />
    <Route path="/meetings/:meetingId" element={<Suspense><MeetingRoomPage /></Suspense>} />
    <Route path="/meetings/:meetingId/live" element={<MeetingRedirect />} />
    <Route path="/meetings/:meetingId/summary" element={<MeetingRedirect />} />
  </>
);
