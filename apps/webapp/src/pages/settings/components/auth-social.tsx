import { Trash2 } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface SocialSignInItem {
  logo: string;
  title: string;
  email: string;
  connected: boolean;
}

const SOCIAL_ITEMS: SocialSignInItem[] = [
  {
    logo: 'google.svg',
    title: 'Google',
    email: 'Connexion via Google OAuth',
    connected: true,
  },
];

export function AuthSocial() {
  return (
    <Card>
      <CardHeader id="auth_social">
        <CardTitle>Connexion sociale</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Connected providers */}
        <div className="grid gap-5 mb-7">
          {SOCIAL_ITEMS.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between flex-wrap border border-border rounded-xl gap-2 px-3.5 py-2.5"
            >
              <div className="flex items-center flex-wrap gap-3.5">
                <img
                  src={toAbsoluteUrl(`/media/brand-logos/${item.logo}`)}
                  className="size-6 shrink-0"
                  alt={item.title}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-sm text-secondary-foreground">
                    {item.email}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <Switch
                  defaultChecked={item.connected}
                  size="sm"
                />
                <Button variant="ghost" mode="icon">
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* More options */}
        <div className="flex flex-col gap-0.5 mb-5">
          <div className="text-base font-medium text-foreground">
            Plus d'options de connexion sociale
          </div>
          <div className="text-sm text-foreground">
            Connectez-vous facilement avec votre compte social préféré.
            Un accès simplifié vous attend !
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2.5 mb-7.5">
          <Button variant="outline" disabled>
            <img
              src={toAbsoluteUrl('/media/brand-logos/facebook.svg')}
              className="size-5"
              alt="Facebook"
            />
            Facebook (bientôt)
          </Button>
          <Button variant="outline" disabled>
            <img
              src={toAbsoluteUrl('/media/brand-logos/linkedin.svg')}
              className="size-5"
              alt="LinkedIn"
            />
            LinkedIn (bientôt)
          </Button>
        </div>
        <div className="flex justify-end">
          <Button>Sauvegarder</Button>
        </div>
      </CardContent>
    </Card>
  );
}
