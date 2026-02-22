import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { simulationApi } from '../api/simulation.api';
import type { Simulation, TimelineEntry } from '../types/simulation.types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  PAUSED: 'En pause',
  COMPLETED: 'Terminee',
  ABANDONED: 'Abandonnee',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ABANDONED: 'bg-red-100 text-red-700',
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

function kpiColor(value: number): string {
  if (value > 70) return 'bg-green-500';
  if (value >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function kpiTextColor(value: number): string {
  if (value > 70) return 'text-green-600';
  if (value >= 40) return 'text-yellow-600';
  return 'text-red-600';
}

function KpiGauge({ label, emoji, value }: { label: string; emoji: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-lg border border-border">
      <span className="text-lg">{emoji}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${kpiColor(value)}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${kpiTextColor(value)}`}>{value}%</span>
    </div>
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
            <p className="text-red-600 text-sm">
              {error || 'Simulation introuvable.'}
            </p>
            <Link to="/simulations" className="mt-3 inline-block text-sm text-primary hover:underline">
              Retour aux simulations
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingDecisions = sim.decisions.filter((d) => d.selectedOption === null);
  const pendingEvents = sim.randomEvents.filter((e) => e.selectedOption === null);
  const isActive = sim.status === 'IN_PROGRESS' || sim.status === 'PAUSED';
  const recentTimeline = timeline.slice(0, 5);

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title={sim.project?.name || 'Simulation'} />
        <ToolbarActions>
          <Link
            to="/simulations"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Retour
          </Link>
        </ToolbarActions>
      </Toolbar>

      {/* Project info header */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-lg">{sim.project?.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sim.status]}`}
                >
                  {STATUS_LABELS[sim.status]}
                </span>
              </div>
              {sim.project?.client && (
                <p className="text-sm text-muted-foreground">
                  Client : {sim.project.client}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>📋 {sim.scenario?.title}</span>
                <span>📁 {sim.scenario?.sector}</span>
                <span>🎯 {sim.scenario?.difficulty}</span>
                {sim.project?.initialBudget && (
                  <span>
                    💰 Budget : {sim.project.currentBudget.toLocaleString('fr-FR')} /{' '}
                    {sim.project.initialBudget.toLocaleString('fr-FR')} EUR
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {isActive && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePauseResume}
                  disabled={actionLoading}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    sim.status === 'IN_PROGRESS'
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {sim.status === 'IN_PROGRESS' ? '⏸ Pause' : '▶ Reprendre'}
                </button>
                {sim.status === 'IN_PROGRESS' && (
                  <button
                    onClick={handleAdvancePhase}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    ⏭ Phase suivante
                  </button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Gauges */}
      {sim.kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          <KpiGauge label="Budget" emoji="💰" value={sim.kpis.budget} />
          <KpiGauge label="Delai" emoji="📅" value={sim.kpis.schedule} />
          <KpiGauge label="Qualite" emoji="⭐" value={sim.kpis.quality} />
          <KpiGauge label="Moral equipe" emoji="😊" value={sim.kpis.teamMorale} />
          <KpiGauge label="Niveau risque" emoji="⚠️" value={sim.kpis.riskLevel} />
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
                          ? 'bg-green-500'
                          : phase.status === 'ACTIVE'
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-gray-200'
                      }`}
                    />
                    <p
                      className={`text-[10px] mt-1 truncate text-center ${
                        phase.status === 'ACTIVE'
                          ? 'font-semibold text-blue-600'
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
              🤔 Decisions en attente
              {pendingDecisions.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {pendingDecisions.length}
                </span>
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
                      <p className="text-[10px] text-orange-600 mt-1">
                        ⏰ Limite : {Math.round(dec.timeLimitSeconds / 60)} min
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
              ⚡ Evenements aleatoires
              {pendingEvents.length > 0 && (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                  {pendingEvents.length}
                </span>
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
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium">{evt.title}</h4>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SEVERITY_COLORS[evt.severity]}`}
                          >
                            {evt.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                    {evt.options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {evt.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={async () => {
                              setActionLoading(true);
                              try {
                                await simulationApi.respondToEvent(sim.id, evt.id, i);
                                await loadData();
                              } catch (err: any) {
                                setError(err.message);
                              } finally {
                                setActionLoading(false);
                              }
                            }}
                            disabled={actionLoading}
                            className="w-full text-left p-2 rounded border border-border hover:bg-muted/50 text-xs transition-colors disabled:opacity-50"
                          >
                            <span className="font-medium">{opt.label}</span>
                            {opt.description && (
                              <span className="text-muted-foreground"> - {opt.description}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                🗣 Reunions
                {sim.meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS').length > 0 && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                    {sim.meetings.filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS').length}
                  </span>
                )}
              </CardTitle>
              <Link
                to={`/meetings?simId=${sim.id}`}
                className="text-xs text-primary hover:underline"
              >
                Voir tout →
              </Link>
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
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                        🗣
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{meeting.title}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          {meeting.participants.length} participant(s) · {meeting.durationMinutes} min
                          {meeting._count?.messages ? ` · ${meeting._count.messages} msg` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        meeting.status === 'SCHEDULED'
                          ? 'bg-gray-100 text-gray-700'
                          : meeting.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-700'
                            : meeting.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {meeting.status === 'SCHEDULED'
                        ? 'Demarrer →'
                        : meeting.status === 'IN_PROGRESS'
                          ? 'Reprendre →'
                          : meeting.status === 'COMPLETED'
                            ? 'Terminee'
                            : 'Annulee'}
                    </span>
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
            <CardTitle className="text-sm">👥 Equipe projet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sim.project.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {member.name.charAt(0)}
                  </div>
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
            <CardTitle className="text-sm">📜 Historique recent</CardTitle>
            {timeline.length > 5 && (
              <Link
                to={`/simulations/${sim.id}/timeline`}
                className="text-xs text-primary hover:underline"
              >
                Voir tout →
              </Link>
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
                      ? '📋'
                      : entry.type === 'DECISION'
                        ? '🤔'
                        : entry.type === 'RANDOM_EVENT'
                          ? '⚡'
                          : '📌'}
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
