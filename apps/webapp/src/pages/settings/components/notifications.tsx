import { useState, useEffect, useId } from 'react';
import { Mail, Bell } from '@/components/keenicons/icons';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const FIELD_ROW =
  'grid grid-cols-1 sm:grid-cols-[170px_minmax(0,1fr)] gap-3 sm:gap-4 items-center py-3 border-t border-[var(--neutral-100)] dark:border-white/[0.06] first:border-t-0 first:pt-1';

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
      toast.success('Notifications enregistrées');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      id="preferences_notifications"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          APPLICATION
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">Notifications</h2>
        <p className="text-[13px] text-muted-foreground m-0">Comment vous voulez être prévenu.</p>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Canal email */}
        <div className={FIELD_ROW}>
          <Label htmlFor="notif-email" className="text-[13px] font-medium text-foreground inline-flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            Email
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch id="notif-email" size="sm" checked={notifEmail} onCheckedChange={setNotifEmail} />
            <span className="text-[12px] text-muted-foreground">
              Recevoir les notifications par email
            </span>
          </div>
        </div>

        {/* Niveau email */}
        {notifEmail && (
          <div className={FIELD_ROW}>
            <Label className="text-[13px] font-medium text-foreground">Quand m'envoyer ?</Label>
            <RadioGroup
              value={notifEmailLevel}
              onValueChange={setNotifEmailLevel}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id={id1} />
                <Label htmlFor={id1} className="text-foreground text-[13px] font-normal">
                  Tous les messages et mises à jour
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unread" id={id2} />
                <Label htmlFor={id2} className="text-foreground text-[13px] font-normal">
                  Messages non lus et changements de statut
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id={id3} />
                <Label htmlFor={id3} className="text-foreground text-[13px] font-normal">
                  Désactivé
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Canal navigateur */}
        <div className={FIELD_ROW}>
          <Label htmlFor="notif-browser" className="text-[13px] font-medium text-foreground inline-flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            Navigateur
          </Label>
          <div className="flex items-center gap-2.5">
            <Switch id="notif-browser" size="sm" checked={notifBrowser} onCheckedChange={setNotifBrowser} />
            <span className="text-[12px] text-muted-foreground">
              Notifications push du navigateur
            </span>
          </div>
        </div>

        {/* Niveau navigateur */}
        {notifBrowser && (
          <div className={FIELD_ROW}>
            <Label className="text-[13px] font-medium text-foreground">Quoi notifier ?</Label>
            <RadioGroup
              value={notifDesktopLevel}
              onValueChange={setNotifDesktopLevel}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id={id4} />
                <Label htmlFor={id4} className="text-foreground text-[13px] font-normal">
                  Tous les nouveaux messages
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="important" id={id5} />
                <Label htmlFor={id5} className="text-foreground text-[13px] font-normal">
                  Mentions directes uniquement (recommandé)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id={id6} />
                <Label htmlFor={id6} className="text-foreground text-[13px] font-normal">
                  Désactivé
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Auto-subscribe */}
        <div className={FIELD_ROW}>
          <Label htmlFor="notif-auto-subscribe" className="text-[13px] font-medium text-foreground">
            Suivi automatique
          </Label>
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="notif-auto-subscribe"
              checked={notifAutoSubscribe}
              onCheckedChange={(checked) => setNotifAutoSubscribe(checked === true)}
            />
            <span className="text-[12px] text-muted-foreground">
              S'abonner automatiquement aux simulations que je crée
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-[var(--neutral-100)] dark:border-white/[0.06]">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde…' : 'Enregistrer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
