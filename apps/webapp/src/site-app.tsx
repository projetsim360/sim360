import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { landingRoutes } from '@/features/landing/config/landing.routes';
import { PublicSessionProvider } from '@/features/landing/providers/public-session';

const { BASE_URL } = import.meta.env;

/** Route table of the public site, shared by the browser entry and the build-time prerender. */
export function SiteRoutes() {
  return (
    <Routes>
      {landingRoutes}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/** Minimal browser tree for the public pages: router, document head and a read-only view of the session. */
export function SiteApp() {
  return (
    <HelmetProvider>
      <BrowserRouter basename={BASE_URL}>
        <PublicSessionProvider>
          <SiteRoutes />
        </PublicSessionProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
