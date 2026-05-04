import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/auth-card';

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

  if (status === 'loading') {
    return (
      <AuthCard
        title="Vérification en cours…"
        subtitle="Patientez quelques instants."
      >
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-700)] border-t-transparent" />
        </div>
      </AuthCard>
    );
  }

  if (status === 'success') {
    return (
      <AuthCard
        title="Email vérifié."
        subtitle="Votre compte est maintenant actif. Vous pouvez vous connecter."
      >
        <Button asChild className="w-full">
          <Link to="/auth/sign-in">Se connecter</Link>
        </Button>
      </AuthCard>
    );
  }

  if (status === 'expired') {
    return (
      <AuthCard
        title="Lien expiré."
        subtitle="Le lien de vérification a expiré. Demandez un nouveau lien."
        bottomSlot={
          <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
            Retour à la connexion
          </Link>
        }
      >
        <Button asChild className="w-full">
          <Link to="/auth/sign-in">Retour à la connexion</Link>
        </Button>
      </AuthCard>
    );
  }

  // status === 'error'
  return (
    <AuthCard
      title="Erreur de vérification."
      subtitle="Le lien de vérification est invalide ou a déjà été utilisé."
      bottomSlot={
        <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
          Retour à la connexion
        </Link>
      }
    >
      <Button asChild className="w-full">
        <Link to="/auth/sign-in">Retour à la connexion</Link>
      </Button>
    </AuthCard>
  );
}
