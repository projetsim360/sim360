import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/auth-provider';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KeenIcon } from '@/components/keenicons';
import { GuidedTour } from '@/components/ui/guided-tour';
import type { TourStep } from '@/components/ui/guided-tour';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useDashboardSummary } from '../api/dashboard.api';
import { DashboardHero } from '../components/dashboard-hero';
import { GettingStartedCard } from '../components/getting-started-card';
import { KpiTile } from '../components/kpi-tile';
import { ActiveSimulationsCard } from '../components/active-simulations-card';
import { PriorityActionsCard } from '../components/priority-actions-card';
import { PmoCoachCard } from '../components/pmo-coach-card';
import { ScoreEvolutionCard } from '../components/score-evolution-card';
import { RecentActivityCard } from '../components/recent-activity-card';
import type { SparkTone } from '../components/sparkline';
import { useT } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';

const TOUR: { target: string; title: AppMessageKey; description: AppMessageKey }[] = [
  { target: '[data-slot="toolbar-heading"]', title: 'dashboard.tour.1.title', description: 'dashboard.tour.1.text' },
  { target: 'a[href="/simulations/new"]', title: 'dashboard.tour.2.title', description: 'dashboard.tour.2.text' },
  { target: '[data-tour="getting-started"]', title: 'dashboard.tour.3.title', description: 'dashboard.tour.3.text' },
  { target: '[data-tour="next-step"]', title: 'dashboard.tour.4.title', description: 'dashboard.tour.4.text' },
  { target: '[data-tour="stats"]', title: 'dashboard.tour.5.title', description: 'dashboard.tour.5.text' },
];

function toneFromDelta(delta: number | null | undefined): SparkTone {
  if (delta == null || delta === 0) return 'neutral';
  return delta > 0 ? 'up' : 'down';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useT();
  const tourSteps: TourStep[] = TOUR.map((s) => ({ target: s.target, title: t(s.title), description: t(s.description) }));
  const reduce = useReducedMotion();
  const { data: summary, isLoading, isError } = useDashboardSummary();

  if (isError) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: t('menu.dashboard') }]} title={t('menu.dashboard')} />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <KeenIcon icon="information-2" style="duotone" className="text-3xl text-[var(--neutral-400)]" />
              <p className="text-sm font-medium text-[var(--brand-700)]">{t('dashboard.loadError')}</p>
              <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const loading = isLoading || !summary;
  const stats = summary?.stats;
  const trends = summary?.trends;
  const isNewUser = !loading && (!summary!.user.profileCompleted || stats!.totalSimulations === 0);

  const pendingTotal = summary
    ? summary.pendingActions.decisions +
      summary.pendingActions.events +
      summary.pendingActions.meetings +
      summary.pendingActions.emails +
      summary.pendingActions.deliverables
    : 0;

  const kpis = summary
    ? [
        {
          label: t('dashboard.kpi.active'),
          value: String(stats!.activeSimulations),
          series: trends!.activeSimulations.series,
          delta: trends!.activeSimulations.delta,
          tone: toneFromDelta(trends!.activeSimulations.delta),
        },
        {
          label: t('dashboard.kpi.score'),
          value: stats!.averageScore != null ? String(stats!.averageScore) : '—',
          suffix: stats!.averageScore != null ? '/100' : undefined,
          series: trends!.averageScore.series,
          delta: trends!.averageScore.delta,
          deltaLabel: trends!.averageScore.delta == null ? t('dashboard.kpi.new') : undefined,
          tone: toneFromDelta(trends!.averageScore.delta),
        },
        {
          label: t('dashboard.kpi.completed'),
          value: String(stats!.completedSimulations),
          series: trends!.completedSimulations.series,
          delta: trends!.completedSimulations.delta,
          tone: toneFromDelta(trends!.completedSimulations.delta),
        },
        {
          label: t('dashboard.kpi.pending'),
          value: String(pendingTotal),
          deltaLabel:
            summary.pendingActions.decisions > 0
              ? t('dashboard.kpi.decisions', { count: summary.pendingActions.decisions })
              : pendingTotal === 0
                ? t('dashboard.allClear')
                : undefined,
          tone: pendingTotal > 0 ? ('down' as SparkTone) : ('neutral' as SparkTone),
        },
      ]
    : [];

  return (
    <>
      <GuidedTour steps={tourSteps} storageKey="onboarding_tour_completed" />

      <PageHeader
        breadcrumbs={[{ label: t('menu.dashboard') }]}
        title={t('menu.dashboard')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <Button variant="primary" size="sm" asChild>
            <Link to="/simulations/new">
              <KeenIcon icon="plus" style="duotone" className="text-xs" />
              {t('menu.newSimulation')}
            </Link>
          </Button>
        }
      />

      <div className="px-6 pb-8">
        <div className="grid gap-5 lg:gap-6">
          {summary && (
            <DashboardHero
              firstName={summary.user.firstName || (user?.firstName ?? '')}
              isNewUser={isNewUser}
              activeCount={stats!.activeSimulations}
              averageScore={stats!.averageScore}
              nextStep={summary.nextStep}
            />
          )}

          {summary && summary.gettingStarted.completionPercent < 100 && (
            <div data-tour="getting-started">
              <GettingStartedCard data={summary.gettingStarted} />
            </div>
          )}

          <motion.div
            data-tour="stats"
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5"
          >
            {loading
              ? [0, 1, 2, 3].map((i) => (
                  <div key={i} className="min-h-[128px] animate-pulse rounded-lg bg-[var(--neutral-100)]" />
                ))
              : kpis.map((k, i) => (
                  <KpiTile key={k.label} {...k} index={i} />
                ))}
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <ActiveSimulationsCard simulations={summary?.activeSimulations ?? []} loading={loading} />
            </div>
            <div className="flex flex-col gap-5" data-tour="next-step">
              <PriorityActionsCard actions={summary?.pendingActions ?? null} loading={loading} />
              <PmoCoachCard />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <ScoreEvolutionCard data={summary?.scoreEvolution ?? []} loading={loading} />
            </div>
            <div>
              <RecentActivityCard activities={summary?.recentActivity ?? []} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
