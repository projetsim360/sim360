import { useState, useMemo } from 'react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
      await api.post('/users/me/change-password', {
        currentPassword,
        newPassword,
      });
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
    <Card>
      <CardHeader id="auth_password">
        <CardTitle>Mot de passe</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56">Mot de passe actuel</Label>
            <Input
              type="password"
              placeholder="Votre mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56">Nouveau mot de passe</Label>
            <div className="flex flex-col gap-2 w-full">
              <Input
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
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56">Confirmer le mot de passe</Label>
            <div className="flex flex-col gap-1 w-full">
              <Input
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
        </div>
        <div className="flex justify-end pt-2.5">
          <Button onClick={handleSubmit} disabled={loading || !isValid}>
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
