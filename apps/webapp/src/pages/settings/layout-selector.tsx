import { LayoutGrid, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { useLayoutSwitcher } from '@/providers/layout-switcher-provider';

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

export function LayoutSelectorPage() {
  const { currentLayout, setLayout, resetLayout } = useLayoutSwitcher();

  const handleSelect = (layoutId: string) => {
    if (layoutId === currentLayout) return;
    setLayout(layoutId);
    window.location.reload();
  };

  const handleReset = () => {
    resetLayout();
    window.location.reload();
  };

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Changer de layout" />
        <ToolbarActions>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Réinitialiser par défaut
          </Button>
        </ToolbarActions>
      </Toolbar>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="size-4.5" />
            Layouts disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {AVAILABLE_LAYOUTS.map(({ id, label }) => {
              const isActive = currentLayout === id;
              return (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all hover:shadow-md ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      <Check className="size-3" />
                      Actif
                    </span>
                  )}
                  <span className="text-3xl font-bold text-muted-foreground/50">
                    {id.replace('layout-', '')}
                  </span>
                  <span className="text-sm font-medium text-center">{label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
