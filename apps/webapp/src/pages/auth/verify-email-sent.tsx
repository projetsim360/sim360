import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { AuthCard } from '@/components/auth/auth-card';

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
    <AuthCard
      title="Vérifiez votre boîte mail."
      subtitle={
        email ? (
          <>
            Un lien de vérification a été envoyé à{' '}
            <strong>{email}</strong>.
          </>
        ) : (
          'Un lien de vérification a été envoyé à votre adresse email.'
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
              {resent ? 'Email renvoyé !' : resending ? 'Envoi...' : (
                <>Vous n&apos;avez rien reçu ? <strong>Renvoyer</strong></>
              )}
            </button>
          )}
          <Link to="/auth/sign-in" className="font-medium text-[var(--accent-600)] hover:underline">
            Se connecter
          </Link>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        Cliquez sur le lien pour activer votre compte.
      </p>
    </AuthCard>
  );
}
