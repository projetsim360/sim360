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
  if (daysLeft <= 3) return { label: `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`, color: 'text-warning', urgent: true };
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
          <KeenIcon icon="arrow-left" style="outline" className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 border-l border-border overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Contexte</h3>
        <Button variant="ghost" size="icon" onClick={onToggle} title="Masquer">
          <KeenIcon icon="arrow-right" style="outline" className="size-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}

      {!isLoading && context && (
        <>
          {/* Simulation info */}
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Simulation</p>
              <Badge variant="primary" appearance="light" size="sm">
                Phase {context.simulation.currentPhaseOrder}
              </Badge>
              {context.currentPhase != null && (
                <p className="text-xs mt-1 text-foreground">
                  {context.currentPhase.name}
                </p>
              )}
            </CardContent>
          </Card>

          {/* KPIs */}
          {context.kpis && (
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs">KPIs</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {Object.entries(context.kpis).map(([key, value]) => {
                  const config = KPI_CONFIG[key];
                  if (!config) return null;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <KeenIcon
                          icon={config.icon}
                          style="outline"
                          className="size-3"
                        />
                        {config.label}
                      </span>
                      <span
                        className={cn(
                          'text-xs font-semibold',
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
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs">
                  Livrables en attente ({context.deliverables.pending.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {context.deliverables.pending.map((d, i) => {
                  const deadline = getDeadlineInfo(d.dueDate);
                  return (
                    <div
                      key={i}
                      className="flex flex-col gap-0.5 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(
                          `/simulations/${context.simulation.id}/deliverables`,
                        )
                      }
                    >
                      <div className="flex items-center gap-2 text-xs text-foreground">
                        <KeenIcon
                          icon="document"
                          style="outline"
                          className="size-3 shrink-0"
                        />
                        <span className="truncate font-medium">{d.title}</span>
                        {deadline.urgent && (
                          <KeenIcon
                            icon="notification-on"
                            style="solid"
                            className={cn('size-3 shrink-0 ml-auto', deadline.color)}
                          />
                        )}
                      </div>
                      {d.dueDate && (
                        <div className="flex items-center justify-between pl-5">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(d.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                          <span className={cn('text-[10px] font-medium', deadline.color)}>
                            {deadline.label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Submitted deliverables */}
          {context.deliverables.submitted.length > 0 && (
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs">
                  Livrables soumis ({context.deliverables.submitted.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5">
                {context.deliverables.submitted.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
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
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs">
                  Decisions recentes ({context.decisions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5">
                {context.decisions.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <KeenIcon
                      icon="check-circle"
                      style="outline"
                      className="size-3 shrink-0"
                    />
                    <span className="truncate">{d.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Adaptation mode */}
          {adaptation && (
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs">Adaptation</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <KeenIcon icon="message-text" style="outline" className="size-3" />
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
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <KeenIcon icon="book" style="outline" className="size-3" />
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
