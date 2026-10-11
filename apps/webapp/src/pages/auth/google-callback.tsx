import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setTokens } from '@/lib/auth';
import { AuthCard } from '@/components/auth/auth-card';
import { Link } from 'react-router-dom';
import { useT } from '@/i18n/app/use-t';

export function GoogleCallbackPage() {
  const t = useT();
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
      setError(t('auth.google.error'));
      return;
    }

    setTokens(accessToken, refreshToken);

    const savedPath = sessionStorage.getItem('sim360_redirect_after_login');
    sessionStorage.removeItem('sim360_redirect_after_login');

    // Full page reload to re-initialize AuthProvider with the new tokens
    // This avoids race conditions with AuthProvider's initial fetchUser
    window.location.replace(savedPath || '/dashboard');
  }, [searchParams, navigate, t]);

  if (error) {
    return (
      <AuthCard
        title={t('auth.google.title')}
        subtitle={t('auth.google.subtitle')}
        bottomSlot={
          <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
            {t('auth.backToSignIn')}
          </Link>
        }
      >
        <p className="text-destructive text-sm">{error}</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t('auth.google.title')}
      subtitle={t('auth.google.subtitle')}
    >
      <div className="flex justify-center py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-700)] border-t-transparent" />
      </div>
    </AuthCard>
  );
}
