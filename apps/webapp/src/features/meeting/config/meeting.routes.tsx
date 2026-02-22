import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const MeetingsListPage = lazy(() => import('../pages/meetings-list'));
const MeetingRoomPage = lazy(() => import('../pages/meeting-room'));
const MeetingLivePage = lazy(() => import('../pages/meeting-live'));
const MeetingSummaryPage = lazy(() => import('../pages/meeting-summary'));

export const meetingRoutes = (
  <>
    <Route path="/meetings" element={<Suspense><MeetingsListPage /></Suspense>} />
    <Route path="/meetings/:meetingId" element={<Suspense><MeetingRoomPage /></Suspense>} />
    <Route path="/meetings/:meetingId/live" element={<Suspense><MeetingLivePage /></Suspense>} />
    <Route path="/meetings/:meetingId/summary" element={<Suspense><MeetingSummaryPage /></Suspense>} />
  </>
);
