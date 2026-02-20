import { useLocation, Link } from 'react-router-dom';
import { Mail } from '@/components/keenicons/icons';
import { Button } from '@/components/ui/button';

export function CheckEmailPage() {
  const location = useLocation();
  const email = (location.state as any)?.email || '';

  return (
    <div className="flex flex-col items-center text-center space-y-5">
      <Mail className="size-12 text-primary" />
      <h3 className="text-lg font-medium text-mono">Vérifiez votre email</h3>
      <div className="text-sm text-secondary-foreground">
        Si un compte existe pour{' '}
        {email ? <span className="text-sm font-medium text-mono">{email}</span> : 'cette adresse'}
        , vous recevrez un lien de réinitialisation dans quelques minutes.
        <br />Pensez à vérifier vos spams.
      </div>
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">Retour à la connexion</Link>
      </Button>
    </div>
  );
}
