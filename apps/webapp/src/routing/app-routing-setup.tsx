import { Route, Routes, Navigate } from 'react-router';
import { Layout6 } from '@/components/layouts/layout-6';
import { Layout6Page } from '@/pages/layout-6/page';

export function AppRoutingSetup() {
  return (
    <Routes>
      {/* Layout 6 (demo6) as default layout */}
      <Route element={<Layout6 />}>
        <Route path="/" element={<Layout6Page />} />
        <Route path="/dashboard" element={<Layout6Page />} />
      </Route>

      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
