import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const MeetingsListPage = lazy(() => import('../pages/meetings-list'));

export const meetingRoutes = (
  <>
    <Route path="/meetings" element={<Suspense><MeetingsListPage /></Suspense>} />
  </>
);
