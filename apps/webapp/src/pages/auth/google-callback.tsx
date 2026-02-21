import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setTokens } from '@/lib/auth';
import { api } from '@/lib/api-client';
import { Loader2 } from '@/components/keenicons/icons';

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

    // Fetch user to check profile completion
    const savedPath = sessionStorage.getItem('sim360_redirect_after_login');
    sessionStorage.removeItem('sim360_redirect_after_login');
    api
      .get<{ profileCompleted: boolean }>('/users/me')
      .then((user) => {
        if (!user.profileCompleted) {
          navigate('/profile/wizard', { replace: true });
        } else {
          navigate(savedPath || '/dashboard', { replace: true });
        }
      })
      .catch(() => {
        setError("Erreur lors du chargement du profil");
      });
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="text-center">
        <p className="text-destructive mb-4">{error}</p>
        <a href="/auth/sign-in" className="text-primary hover:underline">
          Retour à la connexion
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Connexion en cours...</p>
      </div>
    </div>
  );
}
