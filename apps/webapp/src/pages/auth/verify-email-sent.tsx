import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VerifyEmailSentPage() {
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
    <div className="flex flex-col items-center text-center space-y-5">
      <Mail className="size-12 text-primary" />
      <h3 className="text-lg font-medium text-mono">Vérifiez votre email</h3>
      <div className="text-sm text-secondary-foreground">
        Nous avons envoyé un lien de vérification à{' '}
        {email ? <span className="text-sm font-medium text-mono">{email}</span> : 'votre adresse email'}
        . Cliquez sur le lien pour activer votre compte.
      </div>
      {email && (
        <Button variant="outline" className="w-full" onClick={handleResend} disabled={resending || resent}>
          {resent ? 'Email renvoyé !' : resending ? 'Envoi...' : 'Renvoyer le lien'}
        </Button>
      )}
      <div className="text-center text-sm">
        <Link to="/auth/sign-in" className="text-sm font-semibold text-foreground hover:text-primary">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
