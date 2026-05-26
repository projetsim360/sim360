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

const ONBOARDING_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-slot="toolbar-heading"]',
    title: 'Voici votre tableau de bord',
    description: "C'est votre QG. Retrouvez vos simulations en cours, vos actions en attente et votre progression.",
  },
  {
    target: 'a[href="/simulations/new"]',
    title: 'Lancez votre première simulation',
    description: 'Choisissez un scénario et immergez-vous dans un projet fictif.',
  },
  {
    target: '[data-tour="getting-started"]',
    title: 'Suivez votre progression',
    description: 'Cette checklist vous guide pas à pas dans la découverte de la plateforme.',
  },
  {
    target: '[data-tour="next-step"]',
    title: 'Actions recommandées',
    description: 'La plateforme vous recommande toujours la prochaine action la plus pertinente.',
  },
  {
    target: '[data-tour="stats"]',
    title: 'Valorisez vos compétences',
    description: 'Après chaque simulation, consultez votre débriefing et partagez vos badges.',
  },
];

function toneFromDelta(delta: number | null | undefined): SparkTone {
  if (delta == null || delta === 0) return 'neutral';
  return delta > 0 ? 'up' : 'down';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const { data: summary, isLoading, isError } = useDashboardSummary();

  if (isError) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: 'Tableau de bord' }]} title="Tableau de bord" />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <KeenIcon icon="information-2" style="duotone" className="text-3xl text-[var(--neutral-400)]" />
              <p className="text-sm font-medium text-[var(--brand-700)]">Impossible de charger le tableau de bord</p>
              <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
                Réessayer
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
          label: 'Simulations actives',
          value: String(stats!.activeSimulations),
          series: trends!.activeSimulations.series,
          delta: trends!.activeSimulations.delta,
          tone: toneFromDelta(trends!.activeSimulations.delta),
        },
        {
          label: 'Score moyen',
          value: stats!.averageScore != null ? String(stats!.averageScore) : '—',
          suffix: stats!.averageScore != null ? '/100' : undefined,
          series: trends!.averageScore.series,
          delta: trends!.averageScore.delta,
          deltaLabel: trends!.averageScore.delta == null ? 'Nouveau' : undefined,
          tone: toneFromDelta(trends!.averageScore.delta),
        },
        {
          label: 'Simulations terminées',
          value: String(stats!.completedSimulations),
          series: trends!.completedSimulations.series,
          delta: trends!.completedSimulations.delta,
          tone: toneFromDelta(trends!.completedSimulations.delta),
        },
        {
          label: 'Actions en attente',
          value: String(pendingTotal),
          deltaLabel:
            summary.pendingActions.decisions > 0
              ? `${summary.pendingActions.decisions} décision${summary.pendingActions.decisions > 1 ? 's' : ''}`
              : pendingTotal === 0
                ? 'Tout est à jour'
                : undefined,
          tone: pendingTotal > 0 ? ('down' as SparkTone) : ('neutral' as SparkTone),
        },
      ]
    : [];

  return (
    <>
      <GuidedTour steps={ONBOARDING_TOUR_STEPS} storageKey="onboarding_tour_completed" />

      <PageHeader
        breadcrumbs={[{ label: 'Tableau de bord' }]}
        title="Tableau de bord"
        subtitle="Suivi de vos simulations en cours et progression globale."
        actions={
          <Button variant="primary" size="sm" asChild>
            <Link to="/simulations/new">
              <KeenIcon icon="plus" style="duotone" className="text-xs" />
              Nouvelle simulation
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
