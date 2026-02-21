import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { setTokens } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck } from '@/components/keenicons/icons';

export function VerifyTwoFactorPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<'totp' | 'backup'>('totp');
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const verifyingRef = useRef(false);

  const handleVerify = useCallback(async (totpCode?: string, backup?: string) => {
    const tempToken = sessionStorage.getItem('sim360_2fa_temp_token');
    if (!tempToken) {
      navigate('/auth/sign-in', { replace: true });
      return;
    }

    setError('');
    setIsLoading(true);
    verifyingRef.current = true;

    try {
      const response = await api.post<{
        tokens: { accessToken: string; refreshToken: string };
        user: { profileCompleted: boolean };
      }>('/auth/2fa/verify', {
        tempToken,
        ...(totpCode ? { code: totpCode } : {}),
        ...(backup ? { backupCode: backup } : {}),
      });

      sessionStorage.removeItem('sim360_2fa_temp_token');
      setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      await refreshUser();

      if (!response.user.profileCompleted) {
        navigate('/profile/wizard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      verifyingRef.current = false;
      setError(err?.message || 'Code invalide. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, refreshUser]);

  const handleOtpComplete = useCallback((value: string) => {
    setCode(value);
    if (value.length === 6) {
      handleVerify(value);
    }
  }, [handleVerify]);

  const handleBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (backupCode.trim()) {
      handleVerify(undefined, backupCode.trim());
    }
  };

  // Redirect if no temp token (but not if we're in the middle of verifying)
  const tempToken = sessionStorage.getItem('sim360_2fa_temp_token');
  if (!tempToken && !verifyingRef.current) {
    navigate('/auth/sign-in', { replace: true });
    return null;
  }

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10">
            <ShieldCheck className="size-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Vérification en deux étapes
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === 'totp'
            ? 'Entrez le code à 6 chiffres de votre application d\'authentification'
            : 'Entrez un de vos codes de secours'}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode === 'totp' ? (
        <div className="flex flex-col items-center gap-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={handleOtpComplete}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Vérification...</span>
            </div>
          )}

          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => { setMode('backup'); setError(''); }}
          >
            Utiliser un code de secours
          </button>
        </div>
      ) : (
        <form onSubmit={handleBackupSubmit} className="flex flex-col gap-4">
          <Input
            placeholder="xxxx-xxxx"
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <Button type="submit" disabled={isLoading || !backupCode.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Vérification...
              </>
            ) : (
              'Vérifier'
            )}
          </Button>
          <button
            type="button"
            className="text-sm text-primary hover:underline text-center"
            onClick={() => { setMode('totp'); setError(''); }}
          >
            Utiliser l'application d'authentification
          </button>
        </form>
      )}

      <div className="text-center mt-8">
        <a href="/auth/sign-in" className="text-sm text-muted-foreground hover:text-foreground">
          Retour à la connexion
        </a>
      </div>
    </div>
  );
}
