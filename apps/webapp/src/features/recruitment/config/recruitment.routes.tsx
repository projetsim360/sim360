import { lazy, Suspense } from 'react';
import { Route } from 'react-router';

const CampaignsListPage = lazy(() => import('../pages/campaigns-list'));
const CreateCampaignPage = lazy(() => import('../pages/create-campaign'));
const CampaignDetailPage = lazy(() => import('../pages/campaign-detail'));
const CandidateReportPage = lazy(() => import('../pages/candidate-report'));
const ShortlistPage = lazy(() => import('../pages/shortlist-page'));
const ComparePage = lazy(() => import('../pages/compare-page'));
const InterviewGuidePage = lazy(() => import('../pages/interview-guide-page'));
const JoinCampaignPage = lazy(() => import('../pages/join-campaign'));

/** Protected recruiter routes (inside DynamicLayout) */
export const recruitmentRoutes = (
  <>
    <Route path="/recruitment/campaigns" element={<Suspense><CampaignsListPage /></Suspense>} />
    <Route path="/recruitment/campaigns/new" element={<Suspense><CreateCampaignPage /></Suspense>} />
    <Route path="/recruitment/campaigns/:id" element={<Suspense><CampaignDetailPage /></Suspense>} />
    <Route path="/recruitment/campaigns/:id/candidates/:candidateId" element={<Suspense><CandidateReportPage /></Suspense>} />
    <Route path="/recruitment/campaigns/:id/shortlist" element={<Suspense><ShortlistPage /></Suspense>} />
    <Route path="/recruitment/campaigns/:id/compare" element={<Suspense><ComparePage /></Suspense>} />
    <Route path="/recruitment/campaigns/:id/candidates/:candidateId/interview" element={<Suspense><InterviewGuidePage /></Suspense>} />
  </>
);

/** Public route (no auth, no layout) — candidate join page */
export const recruitmentJoinRoute = (
  <Route path="/recruitment/join/:slug" element={<Suspense><JoinCampaignPage /></Suspense>} />
);
