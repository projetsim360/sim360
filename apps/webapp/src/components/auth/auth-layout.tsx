import { Outlet } from 'react-router-dom';
import { AuthBranding } from './auth-branding';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="grid grow grid-rows-[auto_1fr] lg:grid-cols-2 lg:grid-rows-1">
        {/* Form panel: left on desktop, below the compact branding header on mobile */}
        <main className="relative order-2 flex items-start justify-center bg-background bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(238,122,58,0.06)_0%,transparent_60%)] p-4 sm:items-center sm:p-6 lg:order-1 lg:min-h-screen lg:p-12">
          <div className="relative w-full max-w-[460px]">
            <Outlet />
          </div>
        </main>

        {/* Branding panel: right on desktop, compact header on mobile */}
        <aside className="order-1 lg:order-2 lg:min-h-screen">
          <AuthBranding />
        </aside>
      </div>
    </div>
  );
}
