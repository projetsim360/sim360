import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { useT } from '@/i18n/app/use-t';
import { Msg } from '@/i18n/app/msg';

export function CheckEmailPage() {
  const t = useT();
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  return (
    <AuthCard
      title={t('auth.checkEmail.title')}
      subtitle={
        email ? (
          <Msg id="auth.checkEmail.sentTo" values={{ email: <strong>{email}</strong> }} />
        ) : (
          t('auth.checkEmail.sent')
        )
      }
      bottomSlot={
        <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      <div className="text-sm text-muted-foreground">
        {email ? (
          <Msg
            id="auth.checkEmail.ifAccountFor"
            values={{ email: <span className="font-medium text-foreground">{email}</span> }}
          />
        ) : (
          t('auth.checkEmail.ifAccount')
        )}
        <br />
        {t('auth.checkEmail.spam')}
      </div>
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">{t('auth.backToSignIn')}</Link>
      </Button>
    </AuthCard>
  );
}
