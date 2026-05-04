import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setTokens } from '@/lib/auth';
import { AuthCard } from '@/components/auth/auth-card';
import { Link } from 'react-router-dom';

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Handle 2FA redirect from Google OAuth
    const requires2FA = searchParams.get('requires2FA');
    const tempToken = searchParams.get('tempToken');

    if (requires2FA === 'true' && tempToken) {
      sessionStorage.setItem('sim360_2fa_temp_token', tempToken);
      navigate('/auth/verify-2fa', { replace: true });
      return;
    }

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setError("Erreur lors de l'authentification Google");
      return;
    }

    setTokens(accessToken, refreshToken);

    const savedPath = sessionStorage.getItem('sim360_redirect_after_login');
    sessionStorage.removeItem('sim360_redirect_after_login');

    // Full page reload to re-initialize AuthProvider with the new tokens
    // This avoids race conditions with AuthProvider's initial fetchUser
    window.location.replace(savedPath || '/dashboard');
  }, [searchParams, navigate]);

  if (error) {
    return (
      <AuthCard
        title="Connexion en cours…"
        subtitle="Vous serez redirigé automatiquement."
        bottomSlot={
          <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
            Retour à la connexion
          </Link>
        }
      >
        <p className="text-destructive text-sm">{error}</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Connexion en cours…"
      subtitle="Vous serez redirigé automatiquement."
    >
      <div className="flex justify-center py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-700)] border-t-transparent" />
      </div>
    </AuthCard>
  );
}
