import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function AuthEmail() {
  const { user } = useAuth();

  return (
    <Card className="pb-2.5">
      <CardHeader id="auth_email">
        <CardTitle>Email</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 pt-7.5">
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full max-w-56">Email</Label>
            <div className="flex flex-col items-start grow gap-7.5 w-full">
              <Input
                type="text"
                value={user?.email || ''}
                disabled
              />
              <div className="flex items-center gap-7.5">
                <Label className="text-foreground text-sm">
                  Actif
                </Label>
                <Switch defaultChecked size="sm" disabled />
                <Label className="text-foreground text-sm">
                  Principal
                </Label>
                <Switch defaultChecked size="sm" disabled />
              </div>
              <span className="text-foreground text-sm font-normal">
                Votre adresse email est utilisée pour la connexion et les notifications.
                Activez ou désactivez les toggles pour personnaliser vos préférences de communication.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
