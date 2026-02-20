import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { CircleCheck } from '@/components/keenicons/icons';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const THEMES = [
  { value: 'light', label: 'Clair', bg: 'bg-zinc-100' },
  { value: 'dark', label: 'Sombre', bg: 'bg-zinc-900' },
  { value: 'system', label: 'Système', bg: 'bg-gradient-to-r from-zinc-100 to-zinc-900' },
] as const;

export function Appearance() {
  const { theme, setTheme } = useTheme();
  const { user, refreshUser } = useAuth();
  const [sidebarTransparent, setSidebarTransparent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSidebarTransparent(user.sidebarTransparent ?? false);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/me/settings', { sidebarTransparent });
      await refreshUser();
      toast.success('Apparence sauvegardée');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader id="preferences_appearance">
        <CardTitle>Apparence</CardTitle>
      </CardHeader>
      <CardContent className="lg:py-7.5">
        {/* Theme mode */}
        <div className="mb-5">
          <h3 className="text-base font-medium text-foreground">Mode du thème</h3>
          <span className="text-sm text-secondary-foreground">
            Sélectionnez ou personnalisez votre thème d'interface
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
          {THEMES.map((item) => {
            const isSelected = theme === item.value;
            return (
              <div key={item.value}>
                <Label
                  className={`flex items-end border rounded-xl h-[170px] mb-0.5 cursor-pointer transition-all ${item.bg} ${
                    isSelected
                      ? 'border-primary border-[3px]'
                      : 'border-input hover:border-primary/50'
                  }`}
                  onClick={() => setTheme(item.value)}
                >
                  <input
                    type="radio"
                    name="theme_option"
                    className="absolute opacity-0 w-0 h-0"
                    checked={isSelected}
                    onChange={() => setTheme(item.value)}
                  />
                  {isSelected && (
                    <CircleCheck size={20} className="ms-5 mb-5 text-primary" />
                  )}
                </Label>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border mt-7 mb-8" />

        {/* Sidebar transparente */}
        <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5 mb-8">
          <Label className="flex w-full max-w-48 text-foreground font-normal">
            Sidebar transparente
          </Label>
          <div className="flex items-center gap-7.5 grow">
            <Label className="text-sm">
              Activer
            </Label>
            <Switch
              size="sm"
              checked={sidebarTransparent}
              onCheckedChange={setSidebarTransparent}
            />
            <span className="text-foreground text-sm font-normal">
              Activez la sidebar transparente pour une interface épurée.
              Désactivez pour un arrière-plan solide.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
