import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { simulationApi } from '../api/simulation.api';
import { PmoFab } from '@/features/pmo/components/pmo-fab';
import { HandoverBanner } from '../components/handover-banner';
import { useKpiSocket } from '../hooks/use-kpi-socket';
import type { Simulation, TimelineEntry, KpiValues } from '../types/simulation.types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  ONBOARDING: 'Passation',
  IN_PROGRESS: 'En cours',
  PAUSED: 'En pause',
  COMPLETED: 'Terminee',
  ABANDONED: 'Abandonnee',
};

const STATUS_VARIANT: Record<string, 'secondary' | 'primary' | 'warning' | 'success' | 'destructive' | 'info'> = {
  DRAFT: 'secondary',
  ONBOARDING: 'info',
  IN_PROGRESS: 'primary',
  PAUSED: 'warning',
  COMPLETED: 'success',
  ABANDONED: 'destructive',
};

const SEVERITY_VARIANT: Record<string, 'info' | 'warning' | 'destructive'> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'warning',
  CRITICAL: 'destructive',
};

const KPI_THEME: Record<string, { bg: string; iconBg: string; text: string; bar: string }> = {
  budget: { bg: '', iconBg: 'bg-muted', text: 'text-primary', bar: 'bg-primary' },
  schedule: { bg: '', iconBg: 'bg-muted', text: 'text-info', bar: 'bg-info' },
  quality: { bg: '', iconBg: 'bg-muted', text: 'text-success', bar: 'bg-success' },
  teamMorale: { bg: '', iconBg: 'bg-muted', text: 'text-warning', bar: 'bg-warning' },
  riskLevel: { bg: '', iconBg: 'bg-muted', text: 'text-destructive', bar: 'bg-destructive' },
};

const KPI_TOOLTIPS: Record<string, string> = {
  budget: 'Pourcentage du budget restant. En dessous de 40%, le projet est en danger financier.',
  schedule: 'Respect du calendrier. En dessous de 40%, le projet risque de depasser les echeances.',
  quality: 'Indice de qualite des livrables et du travail produit.',
  teamMorale: 'Moral de l\'equipe. Un moral bas reduit la productivite.',
  riskLevel: 'Exposition aux risques. Plus c\'est bas, plus la situation est critique.',
};

function KpiBadge({ kpiKey, label, icon, value }: { kpiKey: string; label: string; icon: string; value: number }) {
  const theme = KPI_THEME[kpiKey] ?? KPI_THEME.budget;
  const clamped = Math.min(100, Math.max(0, value));
  const tooltip = KPI_TOOLTIPS[kpiKey];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="overflow-hidden cursor-help">
          <CardContent className="flex items-center gap-3.5 p-4 rounded-lg">
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0', theme.iconBg)}>
              <KeenIcon icon={icon} style="duotone" className={cn('text-xl', theme.text)} />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <span className="text-2xs text-muted-foreground font-medium">{label}</span>
              <span className={cn('text-xl font-semibold leading-none', theme.text)}>{clamped}%</span>
              <div className="h-1.5 rounded-full bg-muted w-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', theme.bar)}
                  style={{ width: `${clamped}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent variant="light" className="max-w-[260px]">
          {tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

export default function SimulationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [simData, timelineData] = await Promise.all([
        simulationApi.getSimulation(id),
        simulationApi.getTimeline(id).catch(() => []),
      ]);
      setSim(simData);
      setTimeline(timelineData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time KPI updates via socket (must be before any early return)
  const handleKpiUpdate = useCallback((kpis: KpiValues) => {
    setSim((prev) => {
      if (!prev) return prev;
      // Sync currentBudget from KPI budget percentage
      const updatedProject = prev.project
        ? {
            ...prev.project,
            currentBudget: Math.round(prev.project.initialBudget * (kpis.budget ?? prev.kpis?.budget ?? 100) / 100),
          }
        : prev.project;
      return { ...prev, kpis: { ...prev.kpis!, ...kpis }, project: updatedProject };
    });
  }, []);
  useKpiSocket(id ?? '', handleKpiUpdate);

  async function handlePauseResume() {
    if (!sim || !id) return;
    setActionLoading(true);
    try {
      if (sim.status === 'IN_PROGRESS') {
        await simulationApi.pauseSimulation(id);
      } else if (sim.status === 'PAUSED') {
        await simulationApi.resumeSimulation(id);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAdvancePhase() {
    if (!id) return;
    setActionLoading(true);
    try {
      await simulationApi.advancePhase(id);
      await loadData();
      toast.success('Phase suivante demarree ! De nouvelles actions sont disponibles.');
    } catch (err: any) {
      setError(err.message);
      toast.error('Erreur lors du passage a la phase suivante.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <Skeleton className="h-10 w-64 mb-5" />
        <Skeleton className="h-24 rounded-lg mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-16 rounded-lg mb-5" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <Skeleton className="h-40 rounded-lg" />
      </div>
    );
  }

  if (error || !sim) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Simulation" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">
              {error || 'Simulation introuvable.'}
            </p>
            <Button variant="link" asChild>
              <Link to="/simulations">Retour aux simulations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOnboarding = sim.status === 'ONBOARDING';
  const pendingDecisions = sim.decisions.filter((d) => d.selectedOption === null);
  const pendingEvents = sim.randomEvents.filter((e) => e.selectedOption === null);
  const isActive = sim.status === 'IN_PROGRESS' || sim.status === 'PAUSED';
  const recentTimeline = timeline.slice(0, 5);

  // KPI alert check
  const criticalKpis = sim.kpis
    ? [
        sim.kpis.budget < 30 && 'Budget',
        sim.kpis.schedule < 30 && 'Delai',
        sim.kpis.quality < 30 && 'Qualite',
        sim.kpis.teamMorale < 30 && 'Moral equipe',
      ].filter(Boolean) as string[]
    : [];

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={sim.project?.name || 'Simulation'} />
        <ToolbarActions>
          {!isOnboarding && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/simulations/${id}/emails`}>
                  <KeenIcon icon="sms" style="duotone" className="text-xs" />
                  Emails
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/simulations/${id}/deliverables`}>
                  <KeenIcon icon="document" style="duotone" className="text-xs" />
                  Livrables
                </Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/simulations">
              <KeenIcon icon="arrow-left" style="duotone" className="text-xs" />
              Retour
            </Link>
          </Button>
          <ContextualHelp
            title="Comment fonctionne la simulation"
            description="La simulation vous plonge dans un projet fictif ou vous prenez des decisions, participez a des reunions virtuelles et gerez des livrables. Vos actions influencent les KPIs du projet."
            tips={[
              'Prenez vos decisions en tenant compte de l\'impact sur le budget, le calendrier et le moral de l\'equipe.',
              'Participez aux reunions pour obtenir des informations cles et influencer l\'equipe.',
              'Surveillez vos KPIs regulierement : en dessous de 30%, le projet est en danger.',
              'Consultez l\'agent PMO pour obtenir des conseils personnalises.',
              'Soumettez vos livrables avant la fin de chaque phase.',
            ]}
          />
        </ToolbarActions>
      </Toolbar>

      {/* Project info header */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge variant={STATUS_VARIANT[sim.status]} appearance="light" size="sm">
                  {STATUS_LABELS[sim.status]}
                </Badge>
                {sim.project?.client && (
                  <span className="text-sm text-muted-foreground">
                    Client : {sim.project.client}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                  <KeenIcon icon="clipboard" style="duotone" className="text-xs text-muted-foreground" />
                  {sim.scenario?.title}
                </Badge>
                <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                  <KeenIcon icon="folder" style="duotone" className="text-xs text-muted-foreground" />
                  {sim.scenario?.sector}
                </Badge>
                <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                  <KeenIcon icon="focus" style="duotone" className="text-xs text-muted-foreground" />
                  {sim.scenario?.difficulty}
                </Badge>
                {sim.scenario?.scenarioType === 'BROWNFIELD' && (
                  <Badge variant="warning" size="sm" className="gap-1.5 font-normal">
                    Reprise en cours
                  </Badge>
                )}
                {!isOnboarding && sim.project?.initialBudget && (
                  <Badge variant="secondary" size="sm" className="gap-1.5 font-normal">
                    <KeenIcon icon="dollar" style="duotone" className="text-xs text-muted-foreground" />
                    {sim.project.currentBudget.toLocaleString('fr-FR')} / {sim.project.initialBudget.toLocaleString('fr-FR')} EUR
                  </Badge>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {isActive && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePauseResume} disabled={actionLoading}>
                  <KeenIcon icon={sim.status === 'IN_PROGRESS' ? 'pause' : 'play'} style="duotone" className="text-xs" />
                  {sim.status === 'IN_PROGRESS' ? 'Pause' : 'Reprendre'}
                </Button>
                {sim.status === 'IN_PROGRESS' && (
                  <DisabledWithTooltip disabled={actionLoading} reason="Chargement en cours...">
                    <Button variant="primary" size="sm" onClick={handleAdvancePhase} disabled={actionLoading}>
                      <KeenIcon icon="arrow-right" style="duotone" className="text-xs" />
                      Phase suivante
                    </Button>
                  </DisabledWithTooltip>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Handover banner (ONBOARDING status) */}
      {sim.status === 'ONBOARDING' && (
        <HandoverBanner simulationId={sim.id} onHandoverComplete={loadData} />
      )}

      {/* Brownfield historical context */}
      {sim.scenario?.scenarioType === 'BROWNFIELD' && sim.scenario?.brownfieldContext && (
        <Card className="mb-5 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-700 dark:text-amber-400">
              Historique herite — Contexte de reprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(sim.scenario.brownfieldContext as any).previousPmNotes && (
              <p className="text-xs italic text-amber-800 dark:text-amber-300">
                &laquo; {(sim.scenario.brownfieldContext as any).previousPmNotes} &raquo;
              </p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-white dark:bg-background rounded border">
                <div className="font-bold text-destructive">{(sim.scenario.brownfieldContext as any).accumulatedDelays}j</div>
                <div className="text-[10px] text-muted-foreground">Retard</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-background rounded border">
                <div className="font-bold text-amber-600">{Math.round((sim.scenario.brownfieldContext as any).budgetUsed * 100)}%</div>
                <div className="text-[10px] text-muted-foreground">Budget consomme</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-background rounded border">
                <div className="font-bold text-amber-600">{((sim.scenario.brownfieldContext as any).knownRisks || []).filter((r: any) => r.status === 'ACTIVE').length}</div>
                <div className="text-[10px] text-muted-foreground">Risques actifs</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-background rounded border">
                <div className="font-bold text-amber-600 capitalize">{(sim.scenario.brownfieldContext as any).teamMorale}</div>
                <div className="text-[10px] text-muted-foreground">Moral equipe</div>
              </div>
            </div>
            {((sim.scenario.brownfieldContext as any).previousDecisions || []).length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Decisions passees</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {((sim.scenario.brownfieldContext as any).previousDecisions as any[]).map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-1.5 bg-white dark:bg-background rounded border">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        d.impact === 'positive' ? 'bg-success' : d.impact === 'negative' ? 'bg-destructive' : 'bg-muted-foreground'
                      }`} />
                      <span className="truncate">{d.title} : {d.outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project content — hidden during ONBOARDING */}
      {!isOnboarding && (
      <>
      {/* KPI Alert */}
      {criticalKpis.length > 0 && (
        <div className="mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-destructive font-medium">
            Alerte : KPI(s) critique(s) en dessous de 30% — {criticalKpis.join(', ')}
          </p>
        </div>
      )}

      {/* KPI Radial Gauges */}
      {sim.kpis && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">Indicateurs de performance</h3>
            <Button variant="link" size="sm" asChild>
              <Link to={`/simulations/${sim.id}/kpis`}>Historique KPIs</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiBadge kpiKey="budget" label="Budget" icon="dollar" value={sim.kpis.budget} />
            <KpiBadge kpiKey="schedule" label="Delai" icon="calendar" value={sim.kpis.schedule} />
            <KpiBadge kpiKey="quality" label="Qualite" icon="medal-star" value={sim.kpis.quality} />
            <KpiBadge kpiKey="teamMorale" label="Moral equipe" icon="people" value={sim.kpis.teamMorale} />
            <KpiBadge kpiKey="riskLevel" label="Niveau risque" icon="shield-cross" value={sim.kpis.riskLevel} />
          </div>
        </div>
      )}

      {/* Phase progress */}
      {sim.phases && sim.phases.length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Progression des phases</CardTitle>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="flex items-center gap-1">
              {sim.phases
                .sort((a, b) => a.order - b.order)
                .map((phase) => (
                  <div key={phase.order} className="flex-1 min-w-0">
                    <div
                      className={cn(
                        'h-3 rounded-full',
                        phase.status === 'COMPLETED'
                          ? 'bg-primary'
                          : phase.status === 'ACTIVE'
                            ? 'bg-[var(--accent-brand)] ring-2 ring-[var(--accent-brand)]/20'
                            : 'bg-muted',
                      )}
                    />
                    <p
                      className={cn(
                        'text-[10px] mt-1 truncate text-center',
                        phase.status === 'ACTIVE'
                          ? 'font-semibold text-[var(--accent-brand)]'
                          : phase.status === 'COMPLETED'
                            ? 'font-medium text-primary'
                            : 'text-muted-foreground',
                      )}
                    >
                      {phase.name}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Pending decisions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeenIcon icon="question-2" style="duotone" className="size-4" /> Decisions en attente
              {pendingDecisions.length > 0 && (
                <Badge variant="primary" appearance="light" size="sm">
                  {pendingDecisions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDecisions.length === 0 ? (
              <EmptyState
                icon="question-2"
                title="Aucune decision en attente"
                description="Les decisions apparaitront au fil de la progression."
              />
            ) : (
              <div className="space-y-2">
                {pendingDecisions.map((dec) => (
                  <Link
                    key={dec.id}
                    to={`/simulations/${sim.id}/decisions/${dec.id}`}
                    className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-medium">{dec.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {dec.context}
                        </p>
                      </div>
                      <span className="text-sm text-primary shrink-0">
                        {dec.options.length} options →
                      </span>
                    </div>
                    {dec.timeLimitSeconds && (
                      <p className="text-[10px] text-warning mt-1">
                        <KeenIcon icon="time" style="duotone" className="size-3" /> Limite : {Math.round(dec.timeLimitSeconds / 60)} min
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending random events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <KeenIcon icon="flash" style="duotone" className="size-4" /> Evenements aleatoires
              {pendingEvents.length > 0 && (
                <Badge variant="warning" appearance="light" size="sm">
                  {pendingEvents.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingEvents.length === 0 ? (
              <EmptyState
                icon="flash"
                title="Aucun evenement"
                description="Des evenements aleatoires peuvent survenir a tout moment !"
              />
            ) : (
              <div className="space-y-2">
                {pendingEvents.map((evt) => (
                  <Link
                    key={evt.id}
                    to={`/simulations/${sim.id}/events/${evt.id}`}
                    className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{evt.title}</h4>
                          <Badge variant={SEVERITY_VARIANT[evt.severity]} appearance="light" size="sm">
                            {evt.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {evt.description}
                        </p>
                      </div>
                      <span className="text-sm text-primary shrink-0">
                        {evt.options.length} options →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meetings */}
      {sim.meetings && sim.meetings.length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <KeenIcon icon="people" style="duotone" className="size-4" /> Reunions
                {sim.meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS').length > 0 && (
                  <Badge variant="primary" appearance="light" size="sm">
                    {sim.meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS').length}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link to={`/meetings?simId=${sim.id}`}>Voir tout</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sim.meetings
                .filter((m) => m.phaseOrder === sim.currentPhaseOrder)
                .map((meeting) => (
                  <Link
                    key={meeting.id}
                    to={`/meetings/${meeting.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        <KeenIcon icon="message-text" style="duotone" className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{meeting.title}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          {meeting.participants.length} participant(s) · {meeting.durationMinutes} min
                          {meeting._count?.messages ? ` · ${meeting._count.messages} msg` : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[meeting.status]} appearance="light" size="sm">
                      {meeting.status === 'SCHEDULED'
                        ? 'Demarrer →'
                        : meeting.status === 'IN_PROGRESS'
                          ? 'Reprendre →'
                          : meeting.status === 'COMPLETED'
                            ? 'Terminee'
                            : 'Annulee'}
                    </Badge>
                  </Link>
                ))}
              {sim.meetings.filter((m) => m.phaseOrder === sim.currentPhaseOrder).length === 0 && (
                <EmptyState
                  icon="message-text"
                  title="Aucune reunion planifiee"
                  description="Avancez dans la simulation pour debloquer de nouvelles reunions."
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team members */}
      {sim.project?.teamMembers && sim.project.teamMembers.length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm"><KeenIcon icon="people" style="duotone" className="size-4" /> Equipe projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sim.project.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border"
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0" loading="lazy" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {member.role} - {member.expertise}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">
                      Moral : {member.morale}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent timeline */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm"><KeenIcon icon="document-2" style="duotone" className="size-4" /> Historique recent</CardTitle>
            {timeline.length > 5 && (
              <Button variant="link" size="sm" asChild>
                <Link to={`/simulations/${sim.id}/timeline`}>Voir tout</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentTimeline.length === 0 ? (
            <EmptyState
              icon="time"
              title="Historique vide"
              description="L'historique se construit au fur et a mesure de vos actions."
            />
          ) : (
            <div className="space-y-3">
              {recentTimeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-sm mt-0.5">
                    {entry.type === 'PHASE_START' || entry.type === 'PHASE_COMPLETE'
                      ? <KeenIcon icon="clipboard" style="duotone" className="size-4" />
                      : entry.type === 'DECISION'
                        ? <KeenIcon icon="question-2" style="duotone" className="size-4" />
                        : entry.type === 'RANDOM_EVENT'
                          ? <KeenIcon icon="flash" style="duotone" className="size-4" />
                          : <KeenIcon icon="geolocation" style="duotone" className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(entry.date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PMO Agent FAB */}
      {id && (
        <PmoFab
          simulationId={id}
          pendingActionsCount={pendingDecisions.length + pendingEvents.length}
        />
      )}
      </>
      )}
    </div>
  );
}
