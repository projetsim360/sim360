import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';

export function CheckEmailPage() {
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  return (
    <AuthCard
      title="Vérifiez votre boîte mail."
      subtitle={
        email ? (
          <>
            Un lien de réinitialisation a été envoyé à{' '}
            <strong>{email}</strong>.
          </>
        ) : (
          'Un lien de réinitialisation a été envoyé à votre adresse.'
        )
      }
      bottomSlot={
        <Link
          to="/auth/sign-in"
          className="font-medium text-[var(--accent-600)] hover:underline"
        >
          Retour à la connexion
        </Link>
      }
    >
      <div className="text-sm text-muted-foreground">
        {email ? (
          <>
            Si un compte existe pour{' '}
            <span className="font-medium text-foreground">{email}</span>
            , vous recevrez un lien de réinitialisation dans quelques minutes.
          </>
        ) : (
          'Si un compte existe pour cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.'
        )}
        <br />Pensez à vérifier vos spams.
      </div>
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">Retour à la connexion</Link>
      </Button>
    </AuthCard>
  );
}
