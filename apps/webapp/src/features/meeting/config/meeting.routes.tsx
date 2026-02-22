import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const MeetingsListPage = lazy(() => import('../pages/meetings-list'));
const MeetingRoomPage = lazy(() => import('../pages/meeting-room'));

export const meetingRoutes = (
  <>
    <Route path="/meetings" element={<Suspense><MeetingsListPage /></Suspense>} />
    <Route path="/meetings/:meetingId" element={<Suspense><MeetingRoomPage /></Suspense>} />
  </>
);
