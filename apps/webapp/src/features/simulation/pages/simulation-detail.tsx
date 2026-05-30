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

const KPI_TOOLTIPS: Record<KpiKey, string> = {
  budget: 'Pourcentage du budget restant. En dessous de 40 %, le projet est en danger financier.',
  schedule: "Respect du calendrier. En dessous de 40 %, le projet risque de dépasser les échéances.",
  quality: 'Indice de qualité des livrables et du travail produit.',
  teamMorale: "Moral de l'équipe. Un moral bas réduit la productivité.",
  riskLevel: "Exposition aux risques. Plus c'est bas, plus la situation est critique.",
};

const KPI_LABELS: Record<KpiKey, string> = {
  budget: 'Budget',
  schedule: 'Délai',
  quality: 'Qualité',
  teamMorale: 'Moral équipe',
  riskLevel: 'Risque',
};

function captionFor(kpiKey: KpiKey, kpis: KpiValues, project: Simulation['project']): string | undefined {
  if (kpiKey === 'budget' && project) {
    const remaining = Math.round((kpis.budget / 100) * project.initialBudget);
    return `${remaining.toLocaleString('fr-FR')} € restants sur ${project.initialBudget.toLocaleString('fr-FR')} €`;
  }
  if (kpiKey === 'schedule') {
    if (kpis.schedule >= 90) return 'Dans les temps';
    if (kpis.schedule >= 60) return 'Glissement léger';
    return 'En retard';
  }
  if (kpiKey === 'quality') {
    if (kpis.quality >= 70) return 'Livrables conformes';
    if (kpis.quality >= 40) return 'À surveiller';
    return 'Qualité dégradée';
  }
  if (kpiKey === 'teamMorale') {
    if (kpis.teamMorale >= 70) return 'Équipe motivée';
    if (kpis.teamMorale >= 40) return 'Tensions légères';
    return 'Démotivation';
  }
  if (kpiKey === 'riskLevel') {
    if (kpis.riskLevel <= 30) return 'Sous contrôle';
    if (kpis.riskLevel <= 60) return 'Vigilance';
    return 'Risque élevé';
  }
  return undefined;
}

export default function SimulationDetailPage() {
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
      toast.error(err instanceof Error ? err.message : 'Action impossible.');
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
      toast.success('Phase suivante démarrée — de nouvelles actions sont disponibles.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du passage de phase.');
    } finally {
      setActionLoading(false);
    }
  }

  if (error) {
    return (
      <>
        <PageHeader breadcrumbs={[{ label: 'Tableau de bord', to: '/dashboard' }, { label: 'Simulations', to: '/simulations' }, { label: 'Cockpit' }]} title="Cockpit" />
        <div className="px-6 pb-6">
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <KeenIcon icon="information-2" style="duotone" className="text-3xl text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Impossible de charger cette simulation</p>
              <p className="max-w-md text-xs text-muted-foreground">{error}</p>
              <Button variant="primary" size="sm" onClick={() => { setError(null); setLoading(true); loadData(); }}>
                Réessayer
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
        <PageHeader breadcrumbs={[{ label: 'Tableau de bord', to: '/dashboard' }, { label: 'Simulations', to: '/simulations' }, { label: 'Cockpit' }]} title="Cockpit" />
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
    { label: 'Tableau de bord', to: '/dashboard' },
    { label: 'Simulations', to: '/simulations' },
    { label: sim.project?.name ?? 'Cockpit' },
  ];

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} title="Cockpit" />

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

          <nav aria-label="Accès rapides" className="flex flex-wrap gap-2">
            {[
              { to: `/simulations/${sim.id}/meetings`, icon: 'message-text', label: 'Réunions' },
              { to: `/simulations/${sim.id}/decisions`, icon: 'question-2', label: 'Décisions' },
              { to: `/simulations/${sim.id}/events`, icon: 'flash', label: 'Événements' },
              { to: `/simulations/${sim.id}/timeline`, icon: 'time', label: 'Chronologie' },
              { to: `/simulations/${sim.id}/kpis`, icon: 'chart-line', label: 'Historique KPI' },
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
                    label={KPI_LABELS[k]}
                    value={kpis[k]}
                    inverse={k === 'riskLevel'}
                    caption={captionFor(k, kpis, sim.project)}
                    tooltip={KPI_TOOLTIPS[k]}
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
