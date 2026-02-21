import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      toast.error(error.message || 'Erreur lors du changement d\'email');
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
    <Card className="pb-2.5">
      <CardHeader id="auth_email">
        <CardTitle>Email</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 pt-7.5">
        {sent && (
          <Alert className="mb-2">
            <AlertDescription>
              Un email de vérification a été envoyé à <strong>{newEmail}</strong>. Cliquez sur le lien pour confirmer le changement.
            </AlertDescription>
          </Alert>
        )}

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56">Email actuel</Label>
            <div className="flex flex-col items-start grow gap-2 w-full">
              <Input
                type="text"
                value={user?.email || ''}
                disabled
              />
            </div>
          </div>
        </div>

        {editing ? (
          <>
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <Label className="flex w-full max-w-56">Nouvel email</Label>
                <Input
                  type="email"
                  placeholder="nouvel@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="w-full">
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <Label className="flex w-full max-w-56">Mot de passe</Label>
                <Input
                  type="password"
                  placeholder="Confirmez avec votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2.5">
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !newEmail.trim() || !password.trim()}>
                {loading ? 'Envoi...' : 'Envoyer la vérification'}
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
              <Label className="flex w-full max-w-56" />
              <div className="flex flex-col gap-3 w-full">
                <span className="text-foreground text-sm font-normal">
                  Votre adresse email est utilisée pour la connexion et les notifications.
                </span>
                <div>
                  <Button variant="outline" size="sm" onClick={() => { setEditing(true); setSent(false); }}>
                    Changer d'email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
