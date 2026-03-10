import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardSummary } from '../api/dashboard.api';
import { dashboardApi } from '../api/dashboard.api';
import { GuidedTour } from '@/components/ui/guided-tour';
import type { TourStep } from '@/components/ui/guided-tour';
import { GettingStartedCard } from '../components/getting-started-card';
import { NextStepCard } from '../components/next-step-card';
import type { DashboardSummary, GlobalDashboard } from '../types/dashboard.types';

const ONBOARDING_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-slot="toolbar-heading"]',
    title: 'Voici votre tableau de bord',
    description: 'C\'est votre QG. Retrouvez vos simulations en cours, vos actions en attente et votre progression.',
  },
  {
    target: 'a[href="/simulations/new"]',
    title: 'Lancez votre premiere simulation',
    description: 'Choisissez un scenario et immergez-vous dans un projet fictif.',
  },
  {
    target: '[data-tour="getting-started"]',
    title: 'Suivez votre progression',
    description: 'Cette checklist vous guide pas a pas dans la decouverte de la plateforme.',
  },
  {
    target: '[data-tour="next-step"]',
    title: 'Actions recommandees',
    description: 'La plateforme vous recommande toujours la prochaine action la plus pertinente.',
  },
  {
    target: '[data-tour="stats"]',
    title: 'Valorisez vos competences',
    description: 'Apres chaque simulation, consultez votre debriefing et partagez vos badges.',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useDashboardSummary();

  // Fallback to legacy dashboard if summary endpoint fails
  const [legacyData, setLegacyData] = useState<GlobalDashboard | null>(null);
  const [legacyLoading, setLegacyLoading] = useState(false);

  useEffect(() => {
    if (summaryError) {
      setLegacyLoading(true);
      dashboardApi
        .getGlobalDashboard()
        .then(setLegacyData)
        .catch(() => {})
        .finally(() => setLegacyLoading(false));
    }
  }, [summaryError]);

  const loading = summaryLoading || legacyLoading;

  // If summary endpoint failed, render legacy-compatible view
  if (summaryError && !legacyLoading && legacyData) {
    return <LegacyDashboard data={legacyData} />;
  }

  return (
    <>
      <GuidedTour steps={ONBOARDING_TOUR_STEPS} storageKey="onboarding_tour_completed" />

      <Toolbar>
        <ToolbarHeading title="Tableau de bord" />
        <ToolbarActions>
          <Button variant="primary" size="sm" asChild>
            <Link to="/simulations/new">
              <KeenIcon icon="plus" style="duotone" className="text-xs" />
              Nouvelle simulation
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        <div className="grid gap-5 lg:gap-7.5">
          {/* Hero welcome */}
          <div className="rounded-2xl bg-card dark:bg-card p-5 lg:p-6 border border-border">
            <h1 className="text-lg font-bold text-foreground">
              Bonjour {user?.firstName ?? ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Voici votre espace de gestion de projet.
            </p>
          </div>

          {/* Row 1: Getting Started */}
          {loading && <SkeletonCard />}
          {summary && summary.gettingStarted.completionPercent < 100 && (
            <div data-tour="getting-started">
              <GettingStartedCard data={summary.gettingStarted} />
            </div>
          )}

          {/* Row 2: Next Step */}
          {summary && (
            <div data-tour="next-step">
              <NextStepCard data={summary.nextStep} />
            </div>
          )}

          {/* Row 3: Active Simulations + Pending Actions */}
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5">
            <ActiveSimulationsCard
              simulations={summary?.activeSimulations ?? []}
              loading={loading}
            />
            <PendingActionsCard
              actions={summary?.pendingActions ?? null}
              loading={loading}
            />
          </div>

          {/* Row 4: Score Evolution + Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5">
            <ScoreEvolutionCard
              data={summary?.scoreEvolution ?? []}
              loading={loading}
            />
            <RecentActivityCard
              activities={summary?.recentActivity ?? []}
              loading={loading}
            />
          </div>

          {/* Row 5: Stats cards */}
          <div data-tour="stats" className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {[
              { icon: 'chart-line', label: 'En cours', value: loading ? '-' : String(summary?.stats.activeSimulations ?? 0), color: 'text-primary', bgColor: '' },
              { icon: 'check-circle', label: 'Terminees', value: loading ? '-' : String(summary?.stats.completedSimulations ?? 0), color: 'text-success', bgColor: '' },
              { icon: 'abstract-26', label: 'Total', value: loading ? '-' : String(summary?.stats.totalSimulations ?? 0), color: 'text-foreground', bgColor: '' },
              { icon: 'medal-star', label: 'Score moyen', value: loading ? '-' : summary?.stats.averageScore != null ? `${summary.stats.averageScore}%` : '-', color: 'text-warning', bgColor: '' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.25 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Active Simulations Card ───────────────────────────────────────────

function ActiveSimulationsCard({
  simulations,
  loading,
}: {
  simulations: DashboardSummary['activeSimulations'];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <KeenIcon icon="chart-line" style="duotone" className="text-base text-primary" />
            Simulations en cours
          </CardTitle>
          <Button variant="link" size="sm" asChild>
            <Link to="/simulations">Voir tout</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : simulations.length === 0 ? (
          <EmptyState
            icon="rocket"
            title="Aucune simulation en cours"
            description="Lancez votre premiere simulation pour commencer votre apprentissage"
            action={{ label: 'Demarrer une simulation', href: '/simulations/new' }}
          />
        ) : (
          <div className="space-y-2">
            {simulations.map((sim) => (
              <Link
                key={sim.id}
                to={`/simulations/${sim.id}`}
                className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-foreground truncate">{sim.projectName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{sim.scenarioTitle}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="primary" appearance="light" size="xs">
                        Phase {sim.currentPhase}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{sim.phaseName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <MiniKpis kpis={sim.kpis} />
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      Reprendre
                      <KeenIcon icon="right" style="duotone" className="text-[10px]" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Pending Actions Card ──────────────────────────────────────────────

interface ActionItem {
  icon: string;
  label: string;
  count: number;
  link: string;
  color: string;
}

function PendingActionsCard({
  actions,
  loading,
}: {
  actions: DashboardSummary['pendingActions'] | null;
  loading: boolean;
}) {
  const items: ActionItem[] = actions
    ? [
        { icon: 'question-2', label: 'Decisions', count: actions.decisions, link: '/simulations', color: 'text-primary' },
        { icon: 'flash', label: 'Evenements', count: actions.events, link: '/simulations', color: 'text-warning' },
        { icon: 'message-text', label: 'Reunions', count: actions.meetings, link: '/simulations', color: 'text-info' },
        { icon: 'sms', label: 'Emails', count: actions.emails, link: '/emails', color: 'text-primary' },
        { icon: 'document', label: 'Livrables', count: actions.deliverables, link: '/deliverables', color: 'text-success' },
      ]
    : [];

  const totalPending = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <KeenIcon icon="notification-status" style="duotone" className="text-base text-warning" />
          Actions en attente
          {totalPending > 0 && (
            <Badge variant="warning" appearance="light" size="sm">
              {totalPending}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : totalPending === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-success/10 mb-3">
              <KeenIcon icon="check-circle" style="duotone" className="text-xl text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">Tout est a jour</p>
            <p className="text-xs text-muted-foreground mt-0.5">Aucune action en attente</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items
              .filter((item) => item.count > 0)
              .map((item) => (
                <Link
                  key={item.label}
                  to={item.link}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={cn('flex items-center justify-center size-8 rounded-lg bg-muted shrink-0')}>
                    <KeenIcon icon={item.icon} style="duotone" className={cn('text-base', item.color)} />
                  </div>
                  <span className="text-sm text-foreground flex-1">{item.label}</span>
                  <Badge variant="secondary" size="sm" shape="circle">
                    {item.count}
                  </Badge>
                  <KeenIcon icon="right" style="duotone" className="text-xs text-muted-foreground" />
                </Link>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Score Evolution Card ──────────────────────────────────────────────

function ScoreEvolutionCard({
  data,
  loading,
}: {
  data: DashboardSummary['scoreEvolution'];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <KeenIcon icon="graph-up" style="duotone" className="text-base text-primary" />
          Evolution du score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : data.length < 2 ? (
          <EmptyState
            icon="graph-up"
            title="Pas encore de donnees"
            description="Completez au moins deux simulations pour voir l'evolution de votre score"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data.map((p) => ({
                name: p.projectName,
                date: new Date(p.completedAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                }),
                score: p.score,
              }))}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                }}
                formatter={(value: number) => [`${value}%`, 'Score']}
                labelFormatter={(_, payload) => {
                  const entry = payload?.[0]?.payload;
                  return entry?.name ?? '';
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Recent Activity Card ──────────────────────────────────────────────

const EVENT_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  decision: { icon: 'question-2', label: 'Decision', color: 'text-primary' },
  meeting: { icon: 'message-text', label: 'Reunion', color: 'text-info' },
  event: { icon: 'flash', label: 'Evenement', color: 'text-warning' },
  deliverable: { icon: 'document', label: 'Livrable', color: 'text-success' },
  simulation: { icon: 'rocket', label: 'Simulation', color: 'text-primary' },
  email: { icon: 'sms', label: 'Email', color: 'text-info' },
};

function RecentActivityCard({
  activities,
  loading,
}: {
  activities: DashboardSummary['recentActivity'];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <KeenIcon icon="time" style="duotone" className="text-base text-muted-foreground" />
          Activite recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : activities.length === 0 ? (
          <EmptyState
            icon="time"
            title="Aucune activite recente"
            description="Votre historique d'activite apparaitra ici"
          />
        ) : (
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {activities.map((activity) => {
              const config = EVENT_TYPE_CONFIG[activity.eventType] ?? EVENT_TYPE_CONFIG['simulation'];
              const activityData = activity.data as Record<string, string>;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
                    <KeenIcon icon={config.icon} style="duotone" className={cn('text-sm', config.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activityData?.title ?? config.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {activityData?.projectName ?? ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="border-0 shadow-none overflow-hidden">
      <CardContent className="flex flex-col items-center justify-center py-5 h-full gap-1.5">
        <div className="flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-800/30 dark:to-brand-900/20">
          <KeenIcon icon={icon} style="duotone" className={cn('size-4', color)} />
        </div>
        <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

// ─── Mini KPIs ─────────────────────────────────────────────────────────

function MiniKpis({
  kpis,
}: {
  kpis: { budget: number; schedule: number; quality: number; morale: number; risk: number };
}) {
  const bars = [
    { value: kpis.budget, label: 'B' },
    { value: kpis.schedule, label: 'D' },
    { value: kpis.quality, label: 'Q' },
  ];

  return (
    <div className="flex items-end gap-0.5 shrink-0">
      {bars.map((b) => (
        <div key={b.label} className="flex flex-col items-center gap-0.5">
          <div className="w-3 h-6 bg-muted rounded-sm overflow-hidden flex flex-col justify-end">
            <div
              className={cn(
                'w-full rounded-sm transition-all',
                b.value > 70 ? 'bg-success' : b.value >= 40 ? 'bg-warning' : 'bg-destructive',
              )}
              style={{ height: `${Math.min(100, Math.max(5, b.value))}%` }}
            />
          </div>
          <span className="text-[8px] text-muted-foreground">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Loading helpers ───────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-2/3" />
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 rounded" />
            ))}
          </div>
          <Skeleton className="h-2 mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Legacy Dashboard Fallback ─────────────────────────────────────────

function LegacyDashboard({ data }: { data: GlobalDashboard }) {
  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Tableau de bord" />
      </Toolbar>

      <div className="container-fixed">
        <div className="grid gap-5 lg:gap-7.5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            <StatCard icon="chart-line" label="En cours" value={String(data.stats.active)} color="text-primary" bgColor="" />
            <StatCard icon="check-circle" label="Terminees" value={String(data.stats.completed)} color="text-success" bgColor="" />
            <StatCard icon="abstract-26" label="Total" value={String(data.stats.total)} color="text-foreground" bgColor="" />
            <StatCard icon="medal-star" label="Score moyen" value={`${data.stats.avgScore}%`} color="text-warning" bgColor="" />
          </div>

          {/* Active sims + actions */}
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <KeenIcon icon="chart-line" style="duotone" className="text-base text-primary" />
                    Simulations en cours
                  </CardTitle>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/simulations">Voir tout</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {data.activeSimulations.length === 0 ? (
                  <EmptyState
                    icon="rocket"
                    title="Aucune simulation en cours"
                    description="Lancez votre premiere simulation pour commencer"
                    action={{ label: 'Demarrer', href: '/simulations/new' }}
                  />
                ) : (
                  <div className="space-y-2">
                    {data.activeSimulations.map((sim) => (
                      <Link
                        key={sim.id}
                        to={`/simulations/${sim.id}`}
                        className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium truncate">{sim.project.name}</h4>
                            <p className="text-xs text-muted-foreground">{sim.scenario.title}</p>
                          </div>
                          {sim.kpis && (
                            <MiniKpis
                              kpis={{
                                budget: sim.kpis.budget,
                                schedule: sim.kpis.schedule,
                                quality: sim.kpis.quality,
                                morale: sim.kpis.teamMorale,
                                risk: sim.kpis.riskLevel,
                              }}
                            />
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <KeenIcon icon="notification-status" style="duotone" className="text-base text-warning" />
                  Prochaines actions
                  <Badge variant="warning" appearance="light" size="sm">
                    {data.nextActions.decisions.length + data.nextActions.meetings.length + data.nextActions.events.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(data.nextActions.decisions.length + data.nextActions.meetings.length + data.nextActions.events.length) === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Aucune action en attente</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {data.nextActions.decisions.map((d) => (
                      <Link
                        key={d.id}
                        to={`/simulations/${d.simulationId}/decisions/${d.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <KeenIcon icon="question-2" style="duotone" className="text-lg shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{d.title}</p>
                          <p className="text-[10px] text-muted-foreground">{d.projectName}</p>
                        </div>
                        <span className="text-[10px] text-primary shrink-0">Decision</span>
                      </Link>
                    ))}
                    {data.nextActions.events.map((e) => (
                      <Link
                        key={e.id}
                        to={`/simulations/${e.simulationId}/events/${e.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <KeenIcon icon="flash" style="duotone" className="text-lg shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{e.title}</p>
                          <p className="text-[10px] text-muted-foreground">{e.projectName}</p>
                        </div>
                        <Badge
                          variant={e.severity === 'CRITICAL' ? 'destructive' : e.severity === 'HIGH' ? 'warning' : 'info'}
                          appearance="light"
                          size="xs"
                        >
                          {e.severity}
                        </Badge>
                      </Link>
                    ))}
                    {data.nextActions.meetings.map((m) => (
                      <Link
                        key={m.id}
                        to={`/meetings/${m.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <KeenIcon icon="message-text" style="duotone" className="text-lg shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{m.title}</p>
                          <p className="text-[10px] text-muted-foreground">{m.projectName}</p>
                        </div>
                        <span className="text-[10px] text-primary shrink-0">
                          {m.status === 'IN_PROGRESS' ? 'Reprendre' : 'Demarrer'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Score evolution */}
          {data.scoreEvolution && data.scoreEvolution.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <KeenIcon icon="graph-up" style="duotone" className="text-base text-primary" />
                  Evolution du score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={data.scoreEvolution.map((p) => ({
                      date: new Date(p.completedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                      score: p.score,
                    }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Score']}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <KeenIcon icon="time" style="duotone" className="text-base text-muted-foreground" />
                Activite recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Aucune activite recente</p>
              ) : (
                <div className="space-y-2">
                  {data.recentActivity.map((a, i) => (
                    <Link
                      key={i}
                      to={`/simulations/${a.simulationId}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <KeenIcon
                        icon={a.type === 'decision' ? 'question-2' : a.type === 'meeting' ? 'message-text' : 'flash'}
                        style="duotone"
                        className="text-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-[10px] text-muted-foreground">{a.projectName}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
