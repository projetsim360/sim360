import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { useT } from '@/i18n/app/use-t';

export function VerifyEmailPage() {
  const t = useT();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    api
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch((err: any) => {
        if (err.message?.includes('TOKEN_EXPIRED')) {
          setStatus('expired');
        } else {
          setStatus('error');
        }
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <AuthCard
        title={t('auth.verifyEmail.loadingTitle')}
        subtitle={t('auth.verifyEmail.loadingSubtitle')}
      >
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-700)] border-t-transparent" />
        </div>
      </AuthCard>
    );
  }

  if (status === 'success') {
    return (
      <AuthCard
        title={t('auth.verifyEmail.doneTitle')}
        subtitle={t('auth.verifyEmail.doneSubtitle')}
      >
        <Button asChild className="w-full">
          <Link to="/auth/sign-in">{t('auth.signIn.submit')}</Link>
        </Button>
      </AuthCard>
    );
  }

  if (status === 'expired') {
    return (
      <AuthCard
        title={t('auth.verifyEmail.expiredTitle')}
        subtitle={t('auth.verifyEmail.expiredSubtitle')}
        bottomSlot={
          <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
            {t('auth.backToSignIn')}
          </Link>
        }
      >
        <Button asChild className="w-full">
          <Link to="/auth/sign-in">{t('auth.backToSignIn')}</Link>
        </Button>
      </AuthCard>
    );
  }

  // status === 'error'
  return (
    <AuthCard
      title={t('auth.verifyEmail.errorTitle')}
      subtitle={t('auth.verifyEmail.errorSubtitle')}
      bottomSlot={
        <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">{t('auth.backToSignIn')}</Link>
      </Button>
    </AuthCard>
  );
}
