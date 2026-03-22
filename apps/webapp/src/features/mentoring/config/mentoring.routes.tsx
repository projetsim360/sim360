import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const MentorDashboardPage = lazy(
  () => import('../pages/mentor-dashboard-page'),
);
const MentorReviewPage = lazy(
  () => import('../pages/mentor-review-page'),
);
const MentoringSessionsPage = lazy(
  () => import('../pages/mentoring-sessions-page'),
);
const MentoringSessionPage = lazy(
  () => import('../pages/mentoring-session-page'),
);

export const mentoringRoutes = (
  <>
    <Route
      path="/mentoring"
      element={
        <Suspense>
          <MentorDashboardPage />
        </Suspense>
      }
    />
    <Route
      path="/mentoring/review/:evaluationId"
      element={
        <Suspense>
          <MentorReviewPage />
        </Suspense>
      }
    />
    <Route
      path="/mentoring/sessions"
      element={
        <Suspense>
          <MentoringSessionsPage />
        </Suspense>
      }
    />
    <Route
      path="/mentoring/session/:id"
      element={
        <Suspense>
          <MentoringSessionPage />
        </Suspense>
      }
    />
  </>
);
