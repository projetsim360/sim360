import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { AlertCircle } from '@/components/keenicons/icons';
import { Alert, AlertIcon, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { useT } from '@/i18n/app/use-t';

export function ConfirmEmailChangePage() {
  const t = useT();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage(t('auth.confirmEmail.noToken'));
      return;
    }

    api
      .get<{ message: string }>(`/auth/confirm-email-change?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || t('auth.confirmEmail.updated'));
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.message || t('auth.confirmEmail.invalid'));
      });
  }, [searchParams, t]);

  if (status === 'loading') {
    return (
      <AuthCard
        title={t('auth.confirmEmail.title')}
        subtitle={t('auth.confirmEmail.subtitle')}
      >
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-700)] border-t-transparent" />
        </div>
        <p className="text-sm text-center text-muted-foreground">
          {t('auth.confirmEmail.checking')}
        </p>
      </AuthCard>
    );
  }

  if (status === 'success') {
    return (
      <AuthCard
        title={t('auth.confirmEmail.doneTitle')}
        subtitle={message}
      >
        <p className="text-sm text-muted-foreground">
          {t('auth.confirmEmail.signInAgain')}
        </p>
        <Button asChild className="w-full">
          <Link to="/auth/sign-in">{t('auth.confirmEmail.signInAgainCta')}</Link>
        </Button>
      </AuthCard>
    );
  }

  // status === 'error'
  return (
    <AuthCard
      title={t('auth.confirmEmail.failedTitle')}
      subtitle={t('auth.confirmEmail.invalid')}
      bottomSlot={
        <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <Alert variant="destructive" appearance="light">
        <AlertIcon><AlertCircle className="size-4" /></AlertIcon>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <p className="text-xs text-muted-foreground">
        {t('auth.confirmEmail.retryHint')}
      </p>
      <Button variant="outline" asChild className="w-full">
        <Link to="/auth/sign-in">{t('auth.backToSignIn')}</Link>
      </Button>
    </AuthCard>
  );
}
