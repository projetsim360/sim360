import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Loader2, CheckCircle } from '@/components/keenicons/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token manquant');
      return;
    }

    api
      .get<{ message: string }>(`/auth/confirm-email-change?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.message || 'Token invalide ou expiré');
      });
  }, [searchParams]);

  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification en cours...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-emerald-500/10">
            <CheckCircle className="size-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Email modifié</h1>
          <p className="text-muted-foreground">{message}</p>
          <Link to="/auth/sign-in" className="text-sm text-primary hover:underline mt-4">
            Se reconnecter
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <Link to="/auth/sign-in" className="text-sm text-primary hover:underline mt-4">
            Retour à la connexion
          </Link>
        </div>
      )}
    </div>
  );
}
