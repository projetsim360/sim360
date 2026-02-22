import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { simulationApi } from '../api/simulation.api';
import { useKpiSocket } from '../hooks/use-kpi-socket';
import type { Simulation, TimelineEntry, KpiValues } from '../types/simulation.types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  PAUSED: 'En pause',
  COMPLETED: 'Terminee',
  ABANDONED: 'Abandonnee',
};

const STATUS_VARIANT: Record<string, 'secondary' | 'primary' | 'warning' | 'success' | 'destructive'> = {
  DRAFT: 'secondary',
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

const KPI_THEME: Record<string, { bg: string; text: string; bar: string }> = {
  budget: { bg: 'bg-primary/10', text: 'text-primary', bar: 'bg-primary' },
  schedule: { bg: 'bg-info/10', text: 'text-info', bar: 'bg-info' },
  quality: { bg: 'bg-success/10', text: 'text-success', bar: 'bg-success' },
  teamMorale: { bg: 'bg-warning/10', text: 'text-warning', bar: 'bg-warning' },
  riskLevel: { bg: 'bg-destructive/10', text: 'text-destructive', bar: 'bg-destructive' },
};

function KpiBadge({ kpiKey, label, icon, value }: { kpiKey: string; label: string; icon: string; value: number }) {
  const theme = KPI_THEME[kpiKey] ?? KPI_THEME.budget;
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-3.5 p-4">
        <div className={`flex items-center justify-center size-12 shrink-0 rounded-lg ${theme.bg}`}>
          <KeenIcon icon={icon} style="duotone" className={`text-xl ${theme.text}`} />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <span className="text-2xs text-muted-foreground font-medium">{label}</span>
          <span className={`text-lg font-semibold leading-none ${theme.text}`}>{clamped}%</span>
          <div className="h-1 rounded-full bg-muted w-full">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${theme.bar}`}
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
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
      return { ...prev, kpis: { ...prev.kpis!, ...kpis } };
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
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
          <Button variant="outline" asChild>
            <Link to="/simulations">Retour</Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {/* Project info header */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-lg">{sim.project?.name}</h2>
                <Badge variant={STATUS_VARIANT[sim.status]} appearance="light" size="sm">
                  {STATUS_LABELS[sim.status]}
                </Badge>
              </div>
              {sim.project?.client && (
                <p className="text-sm text-muted-foreground">
                  Client : {sim.project.client}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><KeenIcon icon="clipboard" style="outline" className="text-sm" /> {sim.scenario?.title}</span>
                <span className="flex items-center gap-1"><KeenIcon icon="folder" style="outline" className="text-sm" /> {sim.scenario?.sector}</span>
                <span className="flex items-center gap-1"><KeenIcon icon="target" style="outline" className="text-sm" /> {sim.scenario?.difficulty}</span>
                {sim.project?.initialBudget && (
                  <span className="flex items-center gap-1">
                    <KeenIcon icon="dollar" style="outline" className="text-sm" /> Budget : {sim.project.currentBudget.toLocaleString('fr-FR')} /{' '}
                    {sim.project.initialBudget.toLocaleString('fr-FR')} EUR
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {isActive && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePauseResume} disabled={actionLoading}>
                  <KeenIcon icon={sim.status === 'IN_PROGRESS' ? 'pause' : 'play'} style="filled" className="size-4" />
                  {sim.status === 'IN_PROGRESS' ? 'Pause' : 'Reprendre'}
                </Button>
                {sim.status === 'IN_PROGRESS' && (
                  <Button onClick={handleAdvancePhase} disabled={actionLoading}>
                    <KeenIcon icon="right" style="filled" className="size-4" />
                    Phase suivante
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                      className={`h-3 rounded-full ${
                        phase.status === 'COMPLETED'
                          ? 'bg-success'
                          : phase.status === 'ACTIVE'
                            ? 'bg-primary animate-pulse'
                            : 'bg-muted'
                      }`}
                    />
                    <p
                      className={`text-[10px] mt-1 truncate text-center ${
                        phase.status === 'ACTIVE'
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground'
                      }`}
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
              <KeenIcon icon="question-2" style="filled" className="size-4" /> Decisions en attente
              {pendingDecisions.length > 0 && (
                <Badge variant="primary" appearance="light" size="sm">
                  {pendingDecisions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDecisions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Aucune decision en attente.
              </p>
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
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {dec.context}
                        </p>
                      </div>
                      <span className="text-xs text-primary shrink-0">
                        {dec.options.length} options →
                      </span>
                    </div>
                    {dec.timeLimitSeconds && (
                      <p className="text-[10px] text-warning mt-1">
                        <KeenIcon icon="time" style="outline" className="size-3" /> Limite : {Math.round(dec.timeLimitSeconds / 60)} min
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
              <KeenIcon icon="flash" style="filled" className="size-4" /> Evenements aleatoires
              {pendingEvents.length > 0 && (
                <Badge variant="warning" appearance="light" size="sm">
                  {pendingEvents.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Aucun evenement en attente.
              </p>
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
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {evt.description}
                        </p>
                      </div>
                      <span className="text-xs text-primary shrink-0">
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
                <KeenIcon icon="people" style="filled" className="size-4" /> Reunions
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
                        <KeenIcon icon="message-text" style="filled" className="size-4" />
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
                <p className="text-xs text-muted-foreground py-4 text-center">
                  Aucune reunion pour cette phase.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team members */}
      {sim.project?.teamMembers && sim.project.teamMembers.length > 0 && (
        <Card className="mb-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm"><KeenIcon icon="people" style="filled" className="size-4" /> Equipe projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sim.project.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border"
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{member.name}</p>
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
            <CardTitle className="text-sm"><KeenIcon icon="document-2" style="filled" className="size-4" /> Historique recent</CardTitle>
            {timeline.length > 5 && (
              <Button variant="link" size="sm" asChild>
                <Link to={`/simulations/${sim.id}/timeline`}>Voir tout</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentTimeline.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Aucun evenement dans l'historique.
            </p>
          ) : (
            <div className="space-y-3">
              {recentTimeline.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-sm mt-0.5">
                    {entry.type === 'PHASE_START' || entry.type === 'PHASE_COMPLETE'
                      ? <KeenIcon icon="clipboard" style="filled" className="size-4" />
                      : entry.type === 'DECISION'
                        ? <KeenIcon icon="question-2" style="filled" className="size-4" />
                        : entry.type === 'RANDOM_EVENT'
                          ? <KeenIcon icon="flash" style="filled" className="size-4" />
                          : <KeenIcon icon="geolocation" style="filled" className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{entry.title}</p>
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
    </div>
  );
}
