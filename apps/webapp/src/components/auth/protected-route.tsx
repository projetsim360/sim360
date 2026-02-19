import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';

export function ProtectedRoute() {
  const { isLoggedIn, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  if (user && !user.profileCompleted && location.pathname !== '/profile/wizard') {
    return <Navigate to="/profile/wizard" replace />;
  }

  return <Outlet />;
}
