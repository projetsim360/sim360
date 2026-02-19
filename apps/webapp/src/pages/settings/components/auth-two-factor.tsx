import { useState } from 'react';
import { MessageSquareText, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface TwoFactorItem {
  icon: LucideIcon;
  title: string;
  description: string;
  enabled: boolean;
}

const TWO_FACTOR_ITEMS: TwoFactorItem[] = [
  {
    icon: MessageSquareText,
    title: 'Message texte (SMS)',
    description: 'Codes instantanés pour une vérification sécurisée du compte.',
    enabled: false,
  },
  {
    icon: ShieldCheck,
    title: 'Application d\'authentification (TOTP)',
    description: 'Protection renforcée avec une application d\'authentification à deux facteurs.',
    enabled: false,
  },
];

export function AuthTwoFactor() {
  const [password, setPassword] = useState('');

  return (
    <Card>
      <CardHeader id="auth_two_factor">
        <CardTitle>Authentification à deux facteurs (2FA)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 mb-7">
          {TWO_FACTOR_ITEMS.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between flex-wrap border border-border rounded-xl gap-2 px-3.5 py-2.5"
            >
              <div className="flex items-center flex-wrap gap-3.5">
                <div className="flex items-center justify-center size-[50px] rounded-lg bg-muted">
                  <item.icon className="size-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-px">
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-sm font-medium text-secondary-foreground">
                    {item.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-6">
                <Switch
                  size="sm"
                  defaultChecked={item.enabled}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 mb-7">
            <Label className="flex w-full max-w-56">Mot de passe</Label>
            <div className="flex flex-col items-start grow gap-3 w-full">
              <Input
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="text-foreground text-sm font-normal">
                Entrez votre mot de passe pour configurer l'authentification à deux facteurs
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2.5">
          <Button disabled>Configurer</Button>
        </div>
      </CardContent>
    </Card>
  );
}
