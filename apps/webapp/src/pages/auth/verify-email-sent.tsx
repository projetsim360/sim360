import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { AuthCard } from '@/components/auth/auth-card';
import { useT } from '@/i18n/app/use-t';
import { Msg } from '@/i18n/app/msg';

export function VerifyEmailSentPage() {
  const t = useT();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setResent(true);
    } catch {
      // Silent fail — always shows success for security
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title={t('auth.checkEmail.title')}
      subtitle={
        email ? (
          <Msg id="auth.verifySent.sentTo" values={{ email: <strong>{email}</strong> }} />
        ) : (
          t('auth.verifySent.sent')
        )
      }
      bottomSlot={
        <div className="flex flex-col items-center gap-2">
          {email && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resent}
              className="font-medium text-[var(--accent-600)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resent ? t('auth.verifySent.resent') : resending ? t('auth.forgot.sending') : (
                <Msg id="auth.verifySent.resend" values={{ b: (chunks) => <strong>{chunks}</strong> }} />
              )}
            </button>
          )}
          <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
            {t('auth.signIn.submit')}
          </Link>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        {t('auth.verifySent.hint')}
      </p>
    </AuthCard>
  );
}
