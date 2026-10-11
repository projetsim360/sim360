import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';
import { useT } from '@/i18n/app/use-t';

export function ResetPasswordSuccessPage() {
  const t = useT();
  return (
    <AuthCard
      title={t('auth.resetDone.title')}
      subtitle={t('auth.resetDone.subtitle')}
    >
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">{t('auth.signIn.submit')}</Link>
      </Button>
    </AuthCard>
  );
}
