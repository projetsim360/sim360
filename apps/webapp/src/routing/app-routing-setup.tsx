import { Route, Routes, Navigate } from 'react-router';
import { DynamicLayout } from '@/components/layouts/dynamic-layout';
import { AuthLayout } from '@/components/auth/auth-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { SignUpPage } from '@/pages/auth/sign-up';
import { SignInPage } from '@/pages/auth/sign-in';
import { VerifyEmailPage } from '@/pages/auth/verify-email';
import { VerifyEmailSentPage } from '@/pages/auth/verify-email-sent';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { CheckEmailPage } from '@/pages/auth/check-email';
import { ResetPasswordPage } from '@/pages/auth/reset-password';
import { ResetPasswordSuccessPage } from '@/pages/auth/reset-password-success';
import { GoogleCallbackPage } from '@/pages/auth/google-callback';
import { VerifyTwoFactorPage } from '@/pages/auth/verify-2fa';
import { ConfirmEmailChangePage } from '@/pages/auth/confirm-email-change';
import { ProfileWizardPage } from '@/pages/profile/wizard';
import { EditProfilePage } from '@/pages/profile/edit-profile';
import { SettingsPage } from '@/pages/settings';
import {
  dashboardRoutes,
  simulationRoutes,
  meetingRoutes,
  reportRoutes,
  adminReferenceRoutes,
} from '@/features';

export function AppRoutingSetup() {
  return (
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

      {/* Profile wizard (protected, no layout) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile/wizard" element={<ProfileWizardPage />} />
      </Route>

      {/* Protected routes with dynamic layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DynamicLayout />}>
          {/* SaaS core routes */}
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/layout" element={<SettingsPage />} />

          {/* Feature routes (Sim360 domaine) */}
          {dashboardRoutes}
          {simulationRoutes}
          {meetingRoutes}
          {reportRoutes}
          {adminReferenceRoutes}
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
