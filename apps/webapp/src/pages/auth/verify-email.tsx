import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VerifyEmailPage() {
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

  return (
    <>
      {status === 'loading' && (
        <div className="flex flex-col items-center text-center space-y-5">
          <Loader2 className="size-12 animate-spin text-primary" />
          <h3 className="text-lg font-medium text-mono">Vérification en cours...</h3>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center text-center space-y-5">
          <CheckCircle className="size-12 text-green-500" />
          <h3 className="text-lg font-medium text-mono">Email vérifié !</h3>
          <div className="text-sm text-secondary-foreground">
            Votre compte est maintenant actif. Vous pouvez vous connecter.
          </div>
          <Button asChild className="w-full">
            <Link to="/auth/sign-in">Se connecter</Link>
          </Button>
        </div>
      )}

      {status === 'expired' && (
        <div className="flex flex-col items-center text-center space-y-5">
          <XCircle className="size-12 text-yellow-500" />
          <h3 className="text-lg font-medium text-mono">Lien expiré</h3>
          <div className="text-sm text-secondary-foreground">
            Le lien de vérification a expiré. Demandez un nouveau lien.
          </div>
          <Button asChild className="w-full">
            <Link to="/auth/sign-in">Retour à la connexion</Link>
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center text-center space-y-5">
          <XCircle className="size-12 text-destructive" />
          <h3 className="text-lg font-medium text-mono">Erreur de vérification</h3>
          <div className="text-sm text-secondary-foreground">
            Le lien de vérification est invalide ou a déjà été utilisé.
          </div>
          <Button asChild className="w-full">
            <Link to="/auth/sign-in">Retour à la connexion</Link>
          </Button>
        </div>
      )}
    </>
  );
}
