import { useState, useMemo } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const FIELD_ROW =
  'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 20, label: 'Faible', color: 'bg-destructive' };
  if (score <= 3) return { score: 40, label: 'Moyen', color: 'bg-orange-500' };
  if (score <= 4) return { score: 60, label: 'Bon', color: 'bg-yellow-500' };
  if (score <= 5) return { score: 80, label: 'Fort', color: 'bg-emerald-400' };
  return { score: 100, label: 'Excellent', color: 'bg-emerald-500' };
}

function getPasswordErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Au moins 8 caractères');
  if (!/[A-Z]/.test(password)) errors.push('Une lettre majuscule');
  if (!/[a-z]/.test(password)) errors.push('Une lettre minuscule');
  if (!/\d/.test(password)) errors.push('Un chiffre');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Un caractère spécial');
  return errors;
}

export function AuthPassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const errors = useMemo(() => getPasswordErrors(newPassword), [newPassword]);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isValid = errors.length === 0 && !mismatch && currentPassword.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Mot de passe modifié');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="auth_password"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          COMPTE
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Mot de passe</h2>
        <p className="text-[13px] text-muted-foreground m-0">Choisissez un mot de passe robuste.</p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className={FIELD_ROW}>
          <Label htmlFor="auth-pw-current" className="text-[13px] font-medium text-foreground">
            Mot de passe actuel
          </Label>
          <Input
            id="auth-pw-current"
            type="password"
            placeholder="Votre mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className={FIELD_ROW}>
          <Label htmlFor="auth-pw-new" className="text-[13px] font-medium text-foreground">
            Nouveau mot de passe
          </Label>
          <div className="flex flex-col gap-2">
            <Input
              id="auth-pw-new"
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Progress value={strength.score} className="h-1.5 flex-1" indicatorClassName={strength.color} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{strength.label}</span>
                </div>
                {errors.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    {errors.map((err) => (
                      <li key={err} className="text-destructive">- {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={FIELD_ROW}>
          <Label htmlFor="auth-pw-confirm" className="text-[13px] font-medium text-foreground">
            Confirmer
          </Label>
          <div className="flex flex-col gap-1">
            <Input
              id="auth-pw-confirm"
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {mismatch && (
              <span className="text-xs text-destructive">Les mots de passe ne correspondent pas</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSubmit} disabled={loading || !isValid}>
            {loading ? 'Modification…' : 'Modifier le mot de passe'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
