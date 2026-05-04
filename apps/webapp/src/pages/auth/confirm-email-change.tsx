import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { AlertCircle } from '@/components/keenicons/icons';
import { Alert, AlertIcon, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';

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

  if (status === 'loading') {
    return (
      <AuthCard
        title="Confirmer le changement d'email."
        subtitle="Cette action mettra à jour votre adresse de connexion."
      >
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-700)] border-t-transparent" />
        </div>
        <p className="text-sm text-center text-muted-foreground">
          Nous vérifions votre nouvelle adresse email…
        </p>
      </AuthCard>
    );
  }

  if (status === 'success') {
    return (
      <AuthCard
        title="Email modifié."
        subtitle={message}
      >
        <p className="text-sm text-muted-foreground">
          Veuillez vous reconnecter avec votre nouvelle adresse.
        </p>
        <Button asChild className="w-full">
          <Link to="/auth/sign-in">Se reconnecter</Link>
        </Button>
      </AuthCard>
    );
  }

  // status === 'error'
  return (
    <AuthCard
      title="Échec de la vérification."
      subtitle="Le lien de confirmation est invalide ou a expiré."
      bottomSlot={
        <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <Alert variant="destructive" appearance="light">
        <AlertIcon><AlertCircle className="size-4" /></AlertIcon>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <p className="text-xs text-muted-foreground">
        Si le problème persiste, vous pouvez relancer le changement d'email depuis les paramètres de votre compte.
      </p>
      <Button variant="outline" asChild className="w-full">
        <Link to="/auth/sign-in">Retour à la connexion</Link>
      </Button>
    </AuthCard>
  );
}
