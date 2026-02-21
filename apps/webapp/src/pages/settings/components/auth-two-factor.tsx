import { useState } from 'react';
import { ShieldCheck, Loader2 } from '@/components/keenicons/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';

type Step = 'idle' | 'password' | 'qrcode' | 'backup-codes';

export function AuthTwoFactor() {
  const { user, refreshUser } = useAuth();
  const isEnabled = user?.twoFactorEnabled ?? false;

  const [step, setStep] = useState<Step>('idle');
  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Disable state
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisable, setShowDisable] = useState(false);

  // Regenerate state
  const [regenPassword, setRegenPassword] = useState('');
  const [regenCode, setRegenCode] = useState('');
  const [showRegen, setShowRegen] = useState(false);

  const resetState = () => {
    setStep('idle');
    setPassword('');
    setQrCode('');
    setSecret('');
    setCode('');
    setBackupCodes([]);
    setError('');
    setShowDisable(false);
    setDisablePassword('');
    setDisableCode('');
    setShowRegen(false);
    setRegenPassword('');
    setRegenCode('');
  };

  const handleGenerateSecret = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post<{ qrCode: string; secret: string }>('/auth/2fa/generate', { password });
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setStep('qrcode');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la génération du secret');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async (otpCode: string) => {
    if (otpCode.length !== 6) return;
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post<{ backupCodes: string[] }>('/auth/2fa/enable', { code: otpCode });
      setBackupCodes(response.backupCodes);
      setStep('backup-codes');
      await refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Code invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/2fa/disable', { password: disablePassword, code: disableCode });
      await refreshUser();
      resetState();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la désactivation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post<{ backupCodes: string[] }>('/auth/2fa/backup-codes', {
        password: regenPassword,
        code: regenCode,
      });
      setBackupCodes(response.backupCodes);
      setStep('backup-codes');
      setShowRegen(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la régénération');
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
  };

  // ─── Not enabled, idle state ───
  if (!isEnabled && step === 'idle') {
    return (
      <Card>
        <CardHeader id="auth_two_factor">
          <div className="flex items-center justify-between">
            <CardTitle>Authentification à deux facteurs (2FA)</CardTitle>
            <Badge variant="outline">Non activé</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3.5 border border-border rounded-xl px-3.5 py-2.5 mb-5">
            <div className="flex items-center justify-center size-[50px] rounded-lg bg-muted">
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-px">
              <span className="text-sm font-medium text-foreground">
                Application d'authentification (TOTP)
              </span>
              <span className="text-sm text-muted-foreground">
                Protection renforcée avec une application comme Google Authenticator ou Authy.
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep('password')}>Configurer</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Setup step 1: password confirmation ───
  if (!isEnabled && step === 'password') {
    return (
      <Card>
        <CardHeader id="auth_two_factor">
          <CardTitle>Configurer le 2FA - Étape 1/3</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 mb-5">
            <Label className="flex w-full max-w-56">Mot de passe actuel</Label>
            <Input
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && password && handleGenerateSecret()}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetState}>Annuler</Button>
            <Button onClick={handleGenerateSecret} disabled={!password || isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
              Continuer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Setup step 2: QR code + code verification ───
  if (!isEnabled && step === 'qrcode') {
    return (
      <Card>
        <CardHeader id="auth_two_factor">
          <CardTitle>Configurer le 2FA - Étape 2/3</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col items-center gap-4 mb-6">
            <p className="text-sm text-muted-foreground text-center">
              Scannez ce QR code avec votre application d'authentification
            </p>
            {qrCode && (
              <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48 rounded-lg border" />
            )}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Ou entrez ce code manuellement :</p>
              <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded select-all">
                {secret}
              </code>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-medium">Entrez le code à 6 chiffres pour vérifier</p>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                if (val.length === 6) handleEnable(val);
              }}
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
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={resetState}>Annuler</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Setup step 3 / Regenerate: backup codes display ───
  if (step === 'backup-codes') {
    return (
      <Card>
        <CardHeader id="auth_two_factor">
          <CardTitle>Codes de secours</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Conservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.
              Si vous perdez l'accès à votre application d'authentification, ces codes vous permettront de vous connecter.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {backupCodes.map((bc, i) => (
              <code
                key={i}
                className="text-sm font-mono bg-muted px-3 py-2 rounded text-center select-all"
              >
                {bc}
              </code>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={copyBackupCodes}>
              Copier les codes
            </Button>
            <Button onClick={resetState}>Terminé</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── Enabled state ───
  if (isEnabled && step === 'idle') {
    return (
      <Card>
        <CardHeader id="auth_two_factor">
          <div className="flex items-center justify-between">
            <CardTitle>Authentification à deux facteurs (2FA)</CardTitle>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Activé
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3.5 border border-border rounded-xl px-3.5 py-2.5 mb-5">
            <div className="flex items-center justify-center size-[50px] rounded-lg bg-green-100 dark:bg-green-900">
              <ShieldCheck className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex flex-col gap-px">
              <span className="text-sm font-medium text-foreground">
                Application d'authentification (TOTP)
              </span>
              <span className="text-sm text-muted-foreground">
                Votre compte est protégé par l'authentification à deux facteurs.
              </span>
            </div>
          </div>

          {/* Disable section */}
          {showDisable && (
            <div className="border border-border rounded-xl p-4 mb-4">
              <p className="text-sm font-medium mb-3">Désactiver le 2FA</p>
              <div className="flex flex-col gap-3">
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                />
                <Input
                  placeholder="Code TOTP (6 chiffres)"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setShowDisable(false); setError(''); }}>
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisable}
                    disabled={!disablePassword || disableCode.length !== 6 || isLoading}
                  >
                    {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                    Confirmer la désactivation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Regenerate backup codes section */}
          {showRegen && (
            <div className="border border-border rounded-xl p-4 mb-4">
              <p className="text-sm font-medium mb-3">Régénérer les codes de secours</p>
              <div className="flex flex-col gap-3">
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={regenPassword}
                  onChange={(e) => setRegenPassword(e.target.value)}
                />
                <Input
                  placeholder="Code TOTP (6 chiffres)"
                  value={regenCode}
                  onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setShowRegen(false); setError(''); }}>
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRegenerateBackupCodes}
                    disabled={!regenPassword || regenCode.length !== 6 || isLoading}
                  >
                    {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                    Régénérer
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!showDisable && !showRegen && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowRegen(true); setShowDisable(false); }}>
                Régénérer les codes de secours
              </Button>
              <Button variant="destructive" onClick={() => { setShowDisable(true); setShowRegen(false); }}>
                Désactiver
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
