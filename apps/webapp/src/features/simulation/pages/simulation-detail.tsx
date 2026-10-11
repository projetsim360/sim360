import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { toast } from 'sonner';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { simulationApi } from '../api/simulation.api';
import { HandoverBanner } from '../components/handover-banner';
import { CockpitHeader } from '../components/cockpit-header';
import { CockpitPhaseStrip } from '../components/cockpit-phase-strip';
import { CockpitActionsCard } from '../components/cockpit-actions-card';
import { CockpitTimelineCard } from '../components/cockpit-timeline-card';
import { CockpitPmoBanner } from '../components/cockpit-pmo-banner';
import { KpiGauge, type KpiKey } from '../components/kpi-gauge';
import { useKpiSocket } from '../hooks/use-kpi-socket';
import type { Simulation, TimelineEntry, KpiValues } from '../types/simulation.types';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useAppLocale } from '@/providers/locale-provider';
import { useT } from '@/i18n/app/use-t';

const KPI_TOOLTIPS: Record<KpiKey, AppMessageKey> = {
  budget: 'cockpit.kpi.budget.tip',
  schedule: 'cockpit.kpi.schedule.tip',
  quality: 'cockpit.kpi.quality.tip',
  teamMorale: 'cockpit.kpi.morale.tip',
  riskLevel: 'cockpit.kpi.risk.tip',
};

const KPI_LABELS: Record<KpiKey, AppMessageKey> = {
  budget: 'kpi.budget',
  schedule: 'kpi.schedule',
  quality: 'kpi.quality',
  teamMorale: 'cockpit.kpi.teamMorale',
  riskLevel: 'kpi.risk',
};

type T = (id: AppMessageKey, values?: Record<string, string | number>) => string;

function captionFor(kpiKey: KpiKey, kpis: KpiValues, project: Simulation['project'], t: T, locale: 'fr-CA' | 'en-CA'): string | undefined {
  if (kpiKey === 'budget' && project) {
    const remaining = Math.round((kpis.budget / 100) * project.initialBudget);
    const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
    return t('cockpit.kpi.budget.caption', { remaining: money.format(remaining), total: money.format(project.initialBudget) });
  }
  if (kpiKey === 'schedule') {
    if (kpis.schedule >= 90) return t('cockpit.kpi.schedule.ok');
    if (kpis.schedule >= 60) return t('cockpit.kpi.schedule.slip');
    return t('cockpit.kpi.schedule.late');
  }
  if (kpiKey === 'quality') {
    if (kpis.quality >= 70) return t('cockpit.kpi.quality.ok');
    if (kpis.quality >= 40) return t('cockpit.kpi.quality.watch');
    return t('cockpit.kpi.quality.bad');
  }
  if (kpiKey === 'teamMorale') {
    if (kpis.teamMorale >= 70) return t('cockpit.kpi.morale.ok');
    if (kpis.teamMorale >= 40) return t('cockpit.kpi.morale.tension');
    return t('cockpit.kpi.morale.low');
  }
  if (kpiKey === 'riskLevel') {
    if (kpis.riskLevel <= 30) return t('cockpit.kpi.risk.ok');
    if (kpis.riskLevel <= 60) return t('cockpit.kpi.risk.watch');
    return t('cockpit.kpi.risk.high');
  }
  return undefined;
}

export default function SimulationDetailPage() {
  const { intlLocale } = useAppLocale();
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const reduce = useReducedMotion();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleKpiUpdate = useCallback((kpis: KpiValues) => {
    setSim((prev) => {
      if (!prev) return prev;
      const updatedProject = prev.project
        ? {
            ...prev.project,
            currentBudget: Math.round(
              (prev.project.initialBudget * (kpis.budget ?? prev.kpis?.budget ?? 100)) / 100,
            ),
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
      if (sim.status === 'IN_PROGRESS') await simulationApi.pauseSimulation(id);
      else if (sim.status === 'PAUSED') await simulationApi.resumeSimulation(id);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('cockpit.actionFailed'));
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
      toast.success(t('cockpit.phaseStarted'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('cockpit.phaseError'));
    } finally {
      setActionLoading(false);
    }
  }

  if (error) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: t('menu.dashboard'), to: '/dashboard' }, { label: t('menu.simulations'), to: '/simulations' }, { label: t('cockpit.title') }]} title={t('cockpit.title')} />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <KeenIcon icon="information-2" style="duotone" className="text-3xl text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{t('cockpit.loadError')}</p>
              <p className="max-w-md text-xs text-muted-foreground">{error}</p>
              <Button variant="primary" size="sm" onClick={() => { setError(null); setLoading(true); loadData(); }}>
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (loading || !sim) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: t('menu.dashboard'), to: '/dashboard' }, { label: t('menu.simulations'), to: '/simulations' }, { label: t('cockpit.title') }]} title={t('cockpit.title')} />
        <div className="px-6 pb-8">
          <div className="grid gap-5">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[104px] rounded-lg" />)}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-lg" />
              <Skeleton className="h-72 rounded-lg" />
            </div>
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  const pendingDecisions = sim.decisions?.filter((d) => d.selectedOption === null).length ?? 0;
  const kpis = sim.kpis;

  const breadcrumbs = [
    { label: t('menu.dashboard'), to: '/dashboard' },
    { label: t('menu.simulations'), to: '/simulations' },
    { label: sim.project?.name ?? t('cockpit.title') },
  ];

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title={t('cockpit.title')} />

      <div className="px-6 pb-8">
        <div className="grid gap-5">
          {sim.status === 'ONBOARDING' && (
            <HandoverBanner simulationId={sim.id} sim={sim} onHandoverComplete={loadData} />
          )}

          <CockpitHeader
            sim={sim}
            pendingDecisions={pendingDecisions}
            actionLoading={actionLoading}
            onPauseResume={handlePauseResume}
            onAdvancePhase={handleAdvancePhase}
          />

          <CockpitPhaseStrip phases={sim.phases ?? []} />

          <nav aria-label={t('cockpit.quickLinks')} className="flex flex-wrap gap-2">
            {[
              { to: `/simulations/${sim.id}/meetings`, icon: 'message-text', label: t('dashboard.priority.meetings') },
              { to: `/simulations/${sim.id}/decisions`, icon: 'question-2', label: t('dashboard.priority.decisions') },
              { to: `/simulations/${sim.id}/events`, icon: 'flash', label: t('dashboard.priority.events') },
              { to: `/simulations/${sim.id}/timeline`, icon: 'time', label: t('cockpit.timeline') },
              { to: `/simulations/${sim.id}/kpis`, icon: 'chart-line', label: t('cockpit.kpiHistory') },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-[var(--accent-300)] hover:bg-[var(--accent-50)] dark:hover:bg-[var(--accent-500)]/10"
              >
                <KeenIcon icon={l.icon} style="duotone" className="text-sm text-[var(--accent-500)]" />
                {l.label}
              </Link>
            ))}
          </nav>

          {kpis && (
            <motion.div
              variants={reduce ? undefined : staggerContainer}
              initial={reduce ? undefined : 'hidden'}
              animate={reduce ? undefined : 'show'}
              className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4"
            >
              {(['budget', 'schedule', 'quality', 'teamMorale', 'riskLevel'] as KpiKey[]).map((k) => (
                <motion.div key={k} variants={reduce ? undefined : staggerItem}>
                  <KpiGauge
                    kpiKey={k}
                    label={t(KPI_LABELS[k])}
                    value={kpis[k]}
                    inverse={k === 'riskLevel'}
                    caption={captionFor(k, kpis, sim.project, t, intlLocale)}
                    tooltip={t(KPI_TOOLTIPS[k])}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            <CockpitActionsCard
              simulationId={sim.id}
              decisions={sim.decisions ?? []}
              events={sim.randomEvents ?? []}
              meetings={sim.meetings ?? []}
            />
            <CockpitTimelineCard entries={timeline} />
          </div>

          <CockpitPmoBanner />
        </div>
      </div>
    </>
  );
}
