import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import type { PmoContext } from '../types/pmo.types';
import type { ProfileAdaptation } from '@/features/profile/types/profile.types';
import { PMO_TONE_LABELS } from '@/features/profile/types/profile.types';

interface PmoContextPanelProps {
  context: PmoContext | undefined;
  isLoading: boolean;
  collapsed: boolean;
  onToggle: () => void;
  adaptation?: ProfileAdaptation;
}

const KPI_CONFIG: Record<
  string,
  { label: string; icon: string; good: 'high' | 'low' }
> = {
  budget: { label: 'Budget', icon: 'dollar', good: 'high' },
  schedule: { label: 'Delais', icon: 'time', good: 'high' },
  quality: { label: 'Qualite', icon: 'verify', good: 'high' },
  teamMorale: { label: 'Moral', icon: 'people', good: 'high' },
  riskLevel: { label: 'Risque', icon: 'shield-cross', good: 'low' },
};

function kpiColor(key: string, value: number): string {
  const config = KPI_CONFIG[key];
  if (!config) return 'text-foreground';
  if (config.good === 'high') {
    if (value >= 70) return 'text-success';
    if (value >= 40) return 'text-warning';
    return 'text-destructive';
  }
  // good = low (risk)
  if (value <= 30) return 'text-success';
  if (value <= 60) return 'text-warning';
  return 'text-destructive';
}

const TONE_BADGE_VARIANT: Record<ProfileAdaptation['pmoTone'], 'info' | 'success' | 'primary' | 'warning'> = {
  patient: 'info',
  bienveillant: 'success',
  professionnel: 'primary',
  exigeant: 'warning',
};

function getDeadlineInfo(dueDate: string | null): {
  label: string;
  color: string;
  urgent: boolean;
} {
  if (!dueDate) return { label: '', color: 'text-muted-foreground', urgent: false };
  const now = new Date();
  const due = parseISO(dueDate);
  const daysLeft = differenceInDays(due, now);

  if (daysLeft < 0) return { label: `En retard (${Math.abs(daysLeft)}j)`, color: 'text-destructive', urgent: true };
  if (daysLeft < 2) return { label: `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`, color: 'text-destructive', urgent: true };
  if (daysLeft <= 5) return { label: `${daysLeft}j restants`, color: 'text-warning', urgent: true };
  return { label: `${daysLeft}j restants`, color: 'text-muted-foreground', urgent: false };
}

export function PmoContextPanel({
  context,
  isLoading,
  collapsed,
  onToggle,
  adaptation,
}: PmoContextPanelProps) {
  const navigate = useNavigate();
  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          title="Afficher le contexte"
        >
          <KeenIcon icon="arrow-left" style="duotone" className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 dark:bg-white/3">
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}

      {!isLoading && context && (
        <>
          {/* Simulation info */}
          <Card className="shadow-none">
            <CardContent className="p-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                  <KeenIcon icon="chart-line" style="duotone" className="size-4 text-white" />
                </div>
                <div className="min-w-0">
                  <Badge variant="primary" appearance="light" size="xs">
                    Phase {context.simulation.currentPhaseOrder}
                  </Badge>
                  {context.currentPhase != null && (
                    <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                      {context.currentPhase.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          {context.kpis && (
            <Card className="shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">KPIs</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-3">
                {Object.entries(context.kpis).map(([key, value]) => {
                  const config = KPI_CONFIG[key];
                  if (!config) return null;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2.5">
                        <KeenIcon
                          icon={config.icon}
                          style="duotone"
                          className="text-base shrink-0"
                        />
                        {config.label}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          kpiColor(key, value),
                        )}
                      >
                        {value}%
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Pending deliverables */}
          {context.deliverables.pending.length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Livrables en attente ({context.deliverables.pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-2">
                {context.deliverables.pending.map((d) => {
                  const deadline = getDeadlineInfo(d.dueDate);
                  return (
                    <div
                      key={d.id}
                      className="flex flex-col gap-1 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
                      onClick={() =>
                        navigate(
                          `/simulations/${context.simulation.id}/deliverables/${d.id}/edit`,
                        )
                      }
                    >
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <KeenIcon
                          icon="notepad"
                          style="duotone"
                          className="text-sm shrink-0 text-primary"
                        />
                        <span className="truncate font-medium">{d.title}</span>
                        {deadline.urgent && (
                          <KeenIcon
                            icon="notification-on"
                            style="duotone"
                            className={cn('size-3 shrink-0 ml-auto', deadline.color)}
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between pl-5">
                        <Badge
                          variant={d.status === 'DRAFT' ? 'secondary' : d.status === 'REVISED' ? 'info' : 'primary'}
                          appearance="light"
                          size="xs"
                        >
                          {d.status}
                        </Badge>
                        {d.dueDate && (
                          <span className={cn('text-[10px] font-medium', deadline.color)}>
                            {new Date(d.dueDate).toLocaleDateString('fr-FR')} · {deadline.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Submitted deliverables */}
          {context.deliverables.submitted.length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Livrables soumis ({context.deliverables.submitted.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-3">
                {context.deliverables.submitted.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate">
                      {d.title}
                    </span>
                    {d.latestScore !== null && (
                      <Badge
                        variant={d.latestScore >= 70 ? 'success' : d.latestScore >= 40 ? 'warning' : 'destructive'}
                        appearance="light"
                        size="xs"
                      >
                        {d.latestScore}%
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent decisions */}
          {context.decisions.length > 0 && (
            <Card className="shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Decisions recentes ({context.decisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-3">
                {context.decisions.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <KeenIcon
                      icon="check-circle"
                      style="duotone"
                      className="text-base shrink-0"
                    />
                    <span className="truncate">{d.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Adaptation mode */}
          {adaptation && (
            <Card className="shadow-none">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adaptation profil</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2.5">
                    <KeenIcon icon="message-text" style="duotone" className="text-base shrink-0" />
                    Ton PMO
                  </span>
                  <Badge
                    variant={TONE_BADGE_VARIANT[adaptation.pmoTone]}
                    appearance="light"
                    size="xs"
                  >
                    {PMO_TONE_LABELS[adaptation.pmoTone]}
                  </Badge>
                </div>
                {adaptation.showGlossaryTooltips && (
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <KeenIcon icon="book" style="duotone" className="text-base shrink-0" />
                    Glossaire PMI actif
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
