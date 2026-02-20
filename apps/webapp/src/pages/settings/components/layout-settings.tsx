import { LayoutGrid, RotateCcw, Check } from '@/components/keenicons/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLayoutSwitcher } from '@/providers/layout-switcher-provider';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/lib/api-client';

const AVAILABLE_LAYOUTS = [
  { id: 'layout-1', label: 'Sidebar classique' },
  { id: 'layout-2', label: 'Sidebar compacte' },
  { id: 'layout-3', label: 'Sidebar icônes' },
  { id: 'layout-4', label: 'Header horizontal' },
  { id: 'layout-5', label: 'Sidebar sombre' },
  { id: 'layout-6', label: 'Sidebar moderne (défaut)' },
  { id: 'layout-7', label: 'Double sidebar' },
  { id: 'layout-8', label: 'Sidebar flottante' },
  { id: 'layout-9', label: 'Header + tabs' },
  { id: 'layout-10', label: 'Mega menu' },
  { id: 'layout-11', label: 'Sidebar mini' },
  { id: 'layout-12', label: 'Sidebar + sous-menu' },
  { id: 'layout-13', label: 'Header centré' },
  { id: 'layout-14', label: 'Sidebar avec groupes' },
  { id: 'layout-15', label: 'Navigation verticale' },
  { id: 'layout-16', label: 'Sidebar colorée' },
  { id: 'layout-17', label: 'Header minimal' },
  { id: 'layout-18', label: 'Dashboard pro' },
  { id: 'layout-19', label: 'Sidebar expansible' },
  { id: 'layout-20', label: 'Workspace panel' },
  { id: 'layout-21', label: 'Sidebar + toolbar' },
  { id: 'layout-22', label: 'Navigation latérale' },
  { id: 'layout-23', label: 'Header double ligne' },
  { id: 'layout-24', label: 'Sidebar panel' },
  { id: 'layout-25', label: 'Sidebar gradient' },
  { id: 'layout-26', label: 'Panel admin' },
  { id: 'layout-27', label: 'Layout hybride' },
  { id: 'layout-28', label: 'Header + sidebar content' },
  { id: 'layout-29', label: 'Double sidebar nav' },
  { id: 'layout-30', label: 'Sidebar rail' },
  { id: 'layout-31', label: 'Navigation tabs' },
  { id: 'layout-32', label: 'Header collapsible' },
  { id: 'layout-33', label: 'Sidebar + navbar' },
  { id: 'layout-34', label: 'Sidebar contextuelle' },
  { id: 'layout-35', label: 'Header workspace' },
  { id: 'layout-36', label: 'Calendrier' },
  { id: 'layout-37', label: 'Messagerie' },
  { id: 'layout-38', label: 'Chat IA' },
  { id: 'layout-39', label: 'Todo list' },
] as const;

export function LayoutSettings() {
  const { currentLayout, setLayout, resetLayout } = useLayoutSwitcher();
  const { refreshUser } = useAuth();

  const handleSelect = async (layoutId: string) => {
    if (layoutId === currentLayout) return;
    setLayout(layoutId);
    try {
      await api.patch('/users/me/settings', { layoutPreference: layoutId });
      await refreshUser();
    } catch {
      // localStorage already updated, BDD sync failed silently
    }
    window.location.reload();
  };

  const handleReset = async () => {
    resetLayout();
    try {
      await api.patch('/users/me/settings', { layoutPreference: 'layout-6' });
      await refreshUser();
    } catch {
      // localStorage already reset, BDD sync failed silently
    }
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader id="layout_settings" className="flex-wrap gap-2.5">
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="size-4.5" />
          Mise en page
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="size-3.5" />
          Réinitialiser
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {AVAILABLE_LAYOUTS.map(({ id, label }) => {
            const isActive = currentLayout === id;
            return (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isActive && (
                  <span className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                )}
                <span className="text-2xl font-bold text-muted-foreground/50">
                  {id.replace('layout-', '')}
                </span>
                <span className="text-xs font-medium text-center">{label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
