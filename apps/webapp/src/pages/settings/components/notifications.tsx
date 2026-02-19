import { useState, useEffect, useId } from 'react';
import { Mail, Bell } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function Notifications() {
  const id1 = useId();
  const id2 = useId();
  const id3 = useId();
  const id4 = useId();
  const id5 = useId();
  const id6 = useId();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(false);
  const [notifDesktopLevel, setNotifDesktopLevel] = useState('important');
  const [notifEmailLevel, setNotifEmailLevel] = useState('unread');
  const [notifAutoSubscribe, setNotifAutoSubscribe] = useState(true);

  useEffect(() => {
    if (user) {
      setNotifEmail(user.notifEmail ?? true);
      setNotifBrowser(user.notifBrowser ?? false);
      setNotifDesktopLevel(user.notifDesktopLevel || 'important');
      setNotifEmailLevel(user.notifEmailLevel || 'unread');
      setNotifAutoSubscribe(user.notifAutoSubscribe ?? true);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/settings', {
        notifEmail,
        notifBrowser,
        notifDesktopLevel,
        notifEmailLevel,
        notifAutoSubscribe,
      });
      await refreshUser();
      toast.success('Notifications sauvegardées');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader id="preferences_notifications">
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="lg:py-7.5">
        {/* Canaux */}
        <div className="flex flex-wrap items-center gap-5 mb-5 lg:mb-7">
          <div className="flex items-center justify-between flex-wrap grow border border-border rounded-xl gap-2 px-3.5 py-2.5">
            <div className="flex items-center flex-wrap gap-3.5">
              <div className="flex items-center justify-center size-[50px] rounded-lg bg-muted">
                <Mail className="size-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Email
                </span>
                <span className="text-sm text-secondary-foreground">
                  Personnalisez vos préférences email.
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                size="sm"
                checked={notifEmail}
                onCheckedChange={setNotifEmail}
              />
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap grow border border-border rounded-xl gap-2 px-3.5 py-2.5">
            <div className="flex items-center flex-wrap gap-3.5">
              <div className="flex items-center justify-center size-[50px] rounded-lg bg-muted">
                <Bell className="size-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Navigateur
                </span>
                <span className="text-sm text-secondary-foreground">
                  Restez informé avec les notifications push.
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                size="sm"
                checked={notifBrowser}
                onCheckedChange={setNotifBrowser}
              />
            </div>
          </div>
        </div>

        {/* Notifications bureau */}
        <div className="flex flex-col gap-3.5 mb-7">
          <span className="text-base font-medium text-foreground pb-0.5">
            Notifications bureau
          </span>
          <div className="flex flex-col items-start gap-4">
            <RadioGroup value={notifDesktopLevel} onValueChange={setNotifDesktopLevel}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id={id1} />
                <Label htmlFor={id1} variant="secondary">
                  Tous les nouveaux messages
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="important" id={id2} />
                <Label htmlFor={id2} variant="secondary">
                  Mentions directes uniquement (recommandé)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id={id3} />
                <Label htmlFor={id3} variant="secondary">
                  Désactivé
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Notifications email */}
        <div className="flex flex-col gap-3.5 mb-7">
          <span className="text-base font-medium text-foreground pb-0.5">
            Notifications par email
          </span>
          <div className="flex flex-col items-start gap-4">
            <RadioGroup value={notifEmailLevel} onValueChange={setNotifEmailLevel}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id={id4} />
                <Label htmlFor={id4} variant="secondary">
                  Tous les messages et mises à jour
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unread" id={id5} />
                <Label htmlFor={id5} variant="secondary">
                  Messages non lus et changements de statut
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id={id6} />
                <Label htmlFor={id6} variant="secondary">
                  Désactivé
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Abonnements */}
        <div className="flex flex-col gap-3.5">
          <span className="text-base font-medium text-foreground pb-0.5">
            Abonnements
          </span>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={notifAutoSubscribe}
              onCheckedChange={(checked) => setNotifAutoSubscribe(checked === true)}
            />
            <Label>S'abonner automatiquement aux simulations que je crée</Label>
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
