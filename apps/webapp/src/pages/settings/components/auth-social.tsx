import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthSocial() {
  const { user, refreshUser } = useAuth();
  const [unlinking, setUnlinking] = useState(false);
  const [showUnlinkForm, setShowUnlinkForm] = useState(false);
  const [password, setPassword] = useState('');

  const isGoogleLinked = !!user?.googleId;

  const handleUnlinkGoogle = async () => {
    if (!password) return;
    setUnlinking(true);
    try {
      await api.post('/auth/social/unlink-google', { password });
      toast.success('Compte Google délié avec succès');
      setShowUnlinkForm(false);
      setPassword('');
      await refreshUser();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la déliaison');
    } finally {
      setUnlinking(false);
    }
  };

  const handleLinkGoogle = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    sessionStorage.setItem('sim360_redirect_after_login', '/settings');
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <Card>
      <CardHeader id="auth_social">
        <CardTitle>Connexion sociale</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5">
          <div className="flex items-center justify-between flex-wrap border border-border rounded-xl gap-2 px-3.5 py-2.5">
            <div className="flex items-center flex-wrap gap-3.5">
              <img
                src={toAbsoluteUrl('/media/brand-logos/google.svg')}
                className="size-6 shrink-0"
                alt="Google"
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  Google
                </span>
                <span className="text-sm text-secondary-foreground">
                  {isGoogleLinked ? 'Compte Google connecté' : 'Non connecté'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {isGoogleLinked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUnlinkForm(!showUnlinkForm)}
                >
                  Délier
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLinkGoogle}
                >
                  Lier avec Google
                </Button>
              )}
            </div>
          </div>

          {showUnlinkForm && isGoogleLinked && (
            <div className="flex flex-col gap-3 border border-border rounded-xl p-4">
              <div className="text-sm text-secondary-foreground">
                Pour délier votre compte Google, confirmez avec votre mot de passe.
              </div>
              <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
                <Label className="flex w-full max-w-56">Mot de passe</Label>
                <Input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUnlinkForm(false);
                    setPassword('');
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!password || unlinking}
                  onClick={handleUnlinkGoogle}
                >
                  {unlinking ? 'Déliaison...' : 'Confirmer la déliaison'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
