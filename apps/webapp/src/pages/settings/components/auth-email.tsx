import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FIELD_ROW =
  'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

export function AuthEmail() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!newEmail.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await api.post('/users/me/change-email', { newEmail, password });
      setSent(true);
      setEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement d'email");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setNewEmail('');
    setPassword('');
  };

  return (
    <Card
      id="auth_email"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pt-5 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          COMPTE
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Email</h2>
        <p className="text-[13px] text-muted-foreground m-0">
          Adresse utilisée pour la connexion et les notifications.
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        {sent && (
          <Alert className="mb-3">
            <AlertDescription>
              Un email de vérification a été envoyé à <strong>{newEmail}</strong>. Cliquez sur le lien pour confirmer le changement.
            </AlertDescription>
          </Alert>
        )}

        <div className={FIELD_ROW}>
          <Label htmlFor="auth-email-current" className="text-[13px] font-medium text-foreground">
            Email actuel
          </Label>
          <Input id="auth-email-current" type="text" value={user?.email || ''} disabled />
        </div>

        {editing ? (
          <>
            <div className={FIELD_ROW}>
              <Label htmlFor="auth-email-new" className="text-[13px] font-medium text-foreground">
                Nouvel email
              </Label>
              <Input
                id="auth-email-new"
                type="email"
                placeholder="nouvel@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className={FIELD_ROW}>
              <Label htmlFor="auth-email-password" className="text-[13px] font-medium text-foreground">
                Mot de passe
              </Label>
              <Input
                id="auth-email-password"
                type="password"
                placeholder="Confirmez avec votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !newEmail.trim() || !password.trim()}>
                {loading ? 'Envoi…' : 'Envoyer la vérification'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
            <Button variant="outline" size="sm" onClick={() => { setEditing(true); setSent(false); }}>
              Changer d'email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
