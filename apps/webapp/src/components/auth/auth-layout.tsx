import { Outlet } from 'react-router-dom';
import { AuthBranding } from './auth-branding';

export function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="grid lg:grid-cols-2 grow">
        {/* Form panel — left on desktop, second (below branding) on mobile */}
        <div
          className="relative flex justify-center items-center p-6 lg:p-12 order-2 lg:order-1 bg-background min-h-[60vh] lg:min-h-screen"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(238,122,58,0.06) 0%, transparent 60%)',
          }}
        >
          <div className="relative w-full max-w-[460px]">
            <Outlet />
          </div>
        </div>

        {/* Branding panel — right on desktop, first (top) on mobile */}
        <div className="order-1 lg:order-2 min-h-[40vh] lg:min-h-screen">
          <AuthBranding />
        </div>
      </div>
    </div>
  );
}
