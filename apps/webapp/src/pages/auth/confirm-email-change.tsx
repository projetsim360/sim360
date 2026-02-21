import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Loader2, CheckCircle, AlertCircle } from '@/components/keenicons/icons';
import { Alert, AlertIcon, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Le lien de confirmation est invalide. Aucun token fourni.');
      return;
    }

    api
      .get<{ message: string }>(`/auth/confirm-email-change?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Votre adresse email a ete mise a jour avec succes.');
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.message || 'Le lien de confirmation est invalide ou a expire.');
      });
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="size-10 animate-spin text-primary" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Verification en cours</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Nous verifions votre nouvelle adresse email...
            </p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-emerald-500/10">
            <CheckCircle className="size-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Email modifie</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              {message}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Veuillez vous reconnecter avec votre nouvelle adresse.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link to="/auth/sign-in">Se reconnecter</Link>
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Echec de la verification</h2>
          </div>
          <Alert variant="destructive" appearance="light">
            <AlertIcon><AlertCircle className="size-4" /></AlertIcon>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Si le probleme persiste, vous pouvez relancer le changement d'email depuis les parametres de votre compte.
          </p>
          <Button variant="outline" asChild>
            <Link to="/auth/sign-in">Retour a la connexion</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
