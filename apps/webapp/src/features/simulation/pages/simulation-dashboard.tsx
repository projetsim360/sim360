import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { simulationApi } from '../api/simulation.api';

interface KpiGauge {
  value: number;
  critical?: boolean;
  warning?: boolean;
}

interface SimDashboard {
  simulationId: string;
  status: string;
  scenarioTitle: string;
  projectName: string;
  globalScore: number;
  kpiGauges: {
    budget: KpiGauge;
    schedule: KpiGauge;
    quality: KpiGauge;
    teamMorale: KpiGauge;
    riskLevel: KpiGauge;
  } | null;
  currentPhase: { order: number; name: string; type: string } | null;
  phaseProgression: Array<{ order: number; name: string; status: string; type: string }>;
  totalPhases: number;
  pendingActions: {
    decisions: Array<{ id: string; title: string; timeLimitSeconds?: number | null }>;
    events: Array<{ id: string; title: string; severity: string }>;
    meetings: Array<{ id: string; title: string; status: string }>;
  };
  criticalAlerts: string[];
  recentTimeline: Array<{ type: string; date: string; title: string }>;
}

const KPI_LABELS: Record<string, string> = {
  budget: 'Budget',
  schedule: 'Delai',
  quality: 'Qualite',
  teamMorale: 'Moral equipe',
  riskLevel: 'Risque',
};

const KPI_ICONS: Record<string, string> = {
  budget: 'dollar',
  schedule: 'time',
  quality: 'verify',
  teamMorale: 'people',
  riskLevel: 'shield-cross',
};

function CircularGauge({ value, label, icon, critical, warning, isRisk }: {
  value: number;
  label: string;
  icon: string;
  critical?: boolean;
  warning?: boolean;
  isRisk?: boolean;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const displayValue = isRisk ? 100 - value : value;
  const offset = circumference - (displayValue / 100) * circumference;

  const color = critical
    ? 'text-destructive'
    : warning
      ? 'text-warning'
      : displayValue >= 70
        ? 'text-success'
        : displayValue >= 40
          ? 'text-primary'
          : 'text-warning';

  const strokeColor = critical
    ? 'stroke-destructive'
    : warning
      ? 'stroke-warning'
      : displayValue >= 70
        ? 'stroke-success'
        : displayValue >= 40
          ? 'stroke-primary'
          : 'stroke-warning';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${strokeColor} transition-all duration-700`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${color}`}>{Math.round(isRisk ? value : value)}%</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <KeenIcon icon={icon} style="outline" className="size-3.5" />
        <span>{label}</span>
      </div>
      {(critical || warning) && (
        <Badge variant="destructive" size="sm">
          {critical ? 'Critique' : 'Attention'}
        </Badge>
      )}
    </div>
  );
}

const SEVERITY_VARIANT: Record<string, 'destructive' | 'primary' | 'secondary'> = {
  CRITICAL: 'destructive',
  HIGH: 'destructive',
  MEDIUM: 'primary',
  LOW: 'secondary',
};

export default function SimulationDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [dashboard, setDashboard] = useState<SimDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    simulationApi.getSimulationDashboard(id)
      .then(setDashboard)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">{error ?? 'Dashboard introuvable'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedPhases = dashboard.phaseProgression.filter((p) => p.status === 'COMPLETED').length;
  const progressPct = dashboard.totalPhases > 0 ? Math.round((completedPhases / dashboard.totalPhases) * 100) : 0;

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading
          title={dashboard.projectName}
          description={`${dashboard.scenarioTitle} — ${dashboard.status === 'IN_PROGRESS' ? 'En cours' : dashboard.status === 'COMPLETED' ? 'Terminee' : dashboard.status}`}
        />
        <ToolbarActions>
          <Button variant="primary" asChild>
            <Link to={`/simulations/${id}/pmo`}>
              <KeenIcon icon="message-text" style="outline" className="size-4" />
              Agent PMO
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${id}/emails`}>
              <KeenIcon icon="sms" style="outline" className="size-4" />
              Emails
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${id}/deliverables`}>
              <KeenIcon icon="document" style="outline" className="size-4" />
              Livrables
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/simulations/${id}`}>Detail simulation</Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Critical alerts */}
      {dashboard.criticalAlerts.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <KeenIcon icon="notification-status" style="solid" className="size-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Alertes critiques</span>
          </div>
          <ul className="text-xs text-destructive space-y-0.5">
            {dashboard.criticalAlerts.map((alert, i) => (
              <li key={i}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Global score + KPI gauges */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-4">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <span className="text-3xl font-bold text-primary">{dashboard.globalScore}</span>
            <span className="text-xs text-muted-foreground mt-1">Score global</span>
          </CardContent>
        </Card>

        {dashboard.kpiGauges && (
          <Card className="lg:col-span-5">
            <CardContent className="flex items-center justify-around py-4 flex-wrap gap-4">
              {(Object.entries(dashboard.kpiGauges) as [string, KpiGauge][]).map(([key, gauge]) => (
                <CircularGauge
                  key={key}
                  value={gauge.value}
                  label={KPI_LABELS[key] ?? key}
                  icon={KPI_ICONS[key] ?? 'element-11'}
                  critical={gauge.critical}
                  warning={gauge.warning}
                  isRisk={key === 'riskLevel'}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Phase progression */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Progression des phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground ml-2">{progressPct}%</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {dashboard.phaseProgression.map((phase) => {
              const isCurrent = dashboard.currentPhase?.order === phase.order;
              return (
                <Badge
                  key={phase.order}
                  variant={
                    phase.status === 'COMPLETED'
                      ? 'success'
                      : isCurrent
                        ? 'primary'
                        : 'secondary'
                  }
                  appearance={isCurrent ? 'solid' : 'light'}
                  size="sm"
                >
                  {phase.order}. {phase.name}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Pending actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Actions en attente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.pendingActions.decisions.length === 0 &&
              dashboard.pendingActions.events.length === 0 &&
              dashboard.pendingActions.meetings.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucune action en attente.</p>
              )}

            {dashboard.pendingActions.decisions.map((d) => (
              <Link
                key={d.id}
                to={`/simulations/${id}/decisions/${d.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <KeenIcon icon="questionnaire-tablet" style="outline" className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{d.title}</p>
                  <p className="text-[10px] text-muted-foreground">Decision en attente</p>
                </div>
                <KeenIcon icon="arrow-right" style="outline" className="size-3 text-muted-foreground" />
              </Link>
            ))}

            {dashboard.pendingActions.events.map((e) => (
              <Link
                key={e.id}
                to={`/simulations/${id}/events/${e.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                  <KeenIcon icon="notification-status" style="outline" className="size-4 text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{e.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    <Badge variant={SEVERITY_VARIANT[e.severity] ?? 'secondary'} size="sm">{e.severity}</Badge>
                  </p>
                </div>
                <KeenIcon icon="arrow-right" style="outline" className="size-3 text-muted-foreground" />
              </Link>
            ))}

            {dashboard.pendingActions.meetings.map((m) => (
              <Link
                key={m.id}
                to={`/meetings/${m.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                  <KeenIcon icon="people" style="outline" className="size-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{m.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {m.status === 'SCHEDULED' ? 'Planifiee' : 'En cours'}
                  </p>
                </div>
                <KeenIcon icon="arrow-right" style="outline" className="size-3 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent timeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Activite recente</CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link to={`/simulations/${id}/timeline`}>Tout voir</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.recentTimeline.length === 0 && (
              <p className="text-xs text-muted-foreground">Aucune activite recente.</p>
            )}
            {dashboard.recentTimeline.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick navigation */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/simulations/${id}/kpis`}>
            <KeenIcon icon="graph-up" style="outline" className="size-3.5 mr-1.5" />
            Historique KPIs
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/simulations/${id}/meetings`}>
            <KeenIcon icon="people" style="outline" className="size-3.5 mr-1.5" />
            Reunions
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/simulations/${id}/timeline`}>
            <KeenIcon icon="time" style="outline" className="size-3.5 mr-1.5" />
            Timeline
          </Link>
        </Button>
      </div>
    </div>
  );
}
