import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { clearTokens } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function DeleteAccount() {
  const { logout } = useAuth();
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) return;
    setLoading(true);
    try {
      await api.delete('/users/me', { password });
      clearTokens();
      toast.success('Compte supprimé');
      window.location.href = '/auth/sign-in';
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader id="delete_account">
        <CardTitle>Supprimer le compte</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:py-7.5 lg:gap-7.5 gap-3">
        <div className="flex flex-col gap-5">
          <div className="text-sm text-foreground">
            Nous sommes désolés de vous voir partir. La suppression de votre compte
            est irréversible et entraînera la perte définitive de toutes vos données,
            simulations et rapports. Veuillez consulter nos{' '}
            <Button mode="link" asChild>
              <a href="#">conditions d'utilisation</a>
            </Button>{' '}
            si vous souhaitez continuer.
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="confirm_delete"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <Label htmlFor="confirm_delete">
              Je confirme la suppression de mon compte
            </Label>
          </div>
        </div>
        <div className="flex justify-end gap-2.5">
          <Button variant="destructive" disabled={!confirmed || loading} onClick={handleDelete}>
            {loading ? 'Suppression...' : 'Supprimer le compte'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
