import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router';
import { SimexShell } from '@/components/layouts/simex-shell';
import { AuthLayout } from '@/components/auth/auth-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Named-export pages, loaded on demand so the public landing does not pay for them.
const SignUpPage = lazy(() => import('@/pages/auth/sign-up').then((m) => ({ default: m.SignUpPage })));
const SignInPage = lazy(() => import('@/pages/auth/sign-in').then((m) => ({ default: m.SignInPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email').then((m) => ({ default: m.VerifyEmailPage })));
const VerifyEmailSentPage = lazy(() => import('@/pages/auth/verify-email-sent').then((m) => ({ default: m.VerifyEmailSentPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password').then((m) => ({ default: m.ForgotPasswordPage })));
const CheckEmailPage = lazy(() => import('@/pages/auth/check-email').then((m) => ({ default: m.CheckEmailPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password').then((m) => ({ default: m.ResetPasswordPage })));
const ResetPasswordSuccessPage = lazy(() => import('@/pages/auth/reset-password-success').then((m) => ({ default: m.ResetPasswordSuccessPage })));
const GoogleCallbackPage = lazy(() => import('@/pages/auth/google-callback').then((m) => ({ default: m.GoogleCallbackPage })));
const VerifyTwoFactorPage = lazy(() => import('@/pages/auth/verify-2fa').then((m) => ({ default: m.VerifyTwoFactorPage })));
const ConfirmEmailChangePage = lazy(() => import('@/pages/auth/confirm-email-change').then((m) => ({ default: m.ConfirmEmailChangePage })));
const ProfileWizardPage = lazy(() => import('@/pages/profile/wizard').then((m) => ({ default: m.ProfileWizardPage })));
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })));
import {
  dashboardRoutes,
  simulationRoutes,
  actionItemsRoutes,
  meetingRoutes,
  reportRoutes,
  adminReferenceRoutes,
  pmoRoutes,
  deliverableRoutes,
  simulatedEmailRoutes,
  profileRoutes,
  valorizationRoutes,
  badgeVerifyRoute,
  recruitmentRoutes,
  recruitmentJoinRoute,
  mentoringRoutes,
} from '@/features';

export function AppRoutingSetup() {
  return (
    <Suspense fallback={null}>
    <Routes>
      {/* Auth routes (public) */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/auth/verify-email-sent" element={<VerifyEmailSentPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/check-email" element={<CheckEmailPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/reset-password-success" element={<ResetPasswordSuccessPage />} />
        <Route path="/auth/google-callback" element={<GoogleCallbackPage />} />
        <Route path="/auth/verify-2fa" element={<VerifyTwoFactorPage />} />
        <Route path="/auth/confirm-email-change" element={<ConfirmEmailChangePage />} />
      </Route>

      {/* Profile wizard & onboarding (protected, no layout) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile/wizard" element={<ProfileWizardPage />} />
        {profileRoutes}
      </Route>

      {/* Protected routes with SimexShell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SimexShell />}>
          {/* SaaS core routes */}
          <Route path="/profile/edit" element={<Navigate to="/settings" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/layout" element={<Navigate to="/settings" replace />} />

          {/* Feature routes (Simex pro domaine) */}
          {dashboardRoutes}
          {simulationRoutes}
          {actionItemsRoutes}
          {meetingRoutes}
          {reportRoutes}
          {adminReferenceRoutes}
          {pmoRoutes}
          {deliverableRoutes}
          {simulatedEmailRoutes}
          {valorizationRoutes}
          {recruitmentRoutes}
          {mentoringRoutes}
        </Route>
      </Route>

      {/* Public routes (no auth, no layout) */}
      {/* Public pages (/ and /en) are served by the separate site entry, see site-main.tsx */}
      {badgeVerifyRoute}
      {recruitmentJoinRoute}

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </Suspense>
  );
}
