import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { simulationApi } from '../api/simulation.api';
import type { Simulation, SimulationPhase, KpiValues } from '../types/simulation.types';
import { getSectorIcon, getSectorLabel } from '../config/sectors';

const STATUS_CONFIG: Record<Simulation['status'], { label: string; dot: string; pill: string }> = {
  DRAFT: { label: 'Brouillon', dot: 'bg-[var(--neutral-400)]', pill: 'text-[var(--neutral-500)]' },
  ONBOARDING: { label: 'Passation', dot: 'bg-[var(--brand-500)]', pill: 'text-[var(--brand-700)]' },
  IN_PROGRESS: { label: 'En cours', dot: 'bg-[var(--success-500)]', pill: 'text-[var(--success-700)]' },
  PAUSED: { label: 'En pause', dot: 'bg-[var(--warning-500)]', pill: 'text-[var(--warning-700)]' },
  COMPLETED: { label: 'Terminée', dot: 'bg-[var(--brand-500)]', pill: 'text-[var(--brand-700)]' },
  ABANDONED: { label: 'Abandonnée', dot: 'bg-[var(--error-500)]', pill: 'text-[var(--error-700)]' },
};

const DIFFICULTY_LABEL: Record<string, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
  EXPERT: 'Expert',
};

function kpiStroke(value: number, inverse = false): string {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'stroke-[var(--success-500)]';
  if (v >= 40) return 'stroke-[var(--warning-500)]';
  return 'stroke-[var(--error-500)]';
}

function kpiText(value: number, inverse = false): string {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'text-[var(--success-700)]';
  if (v >= 40) return 'text-[var(--warning-700)]';
  return 'text-[var(--error-700)]';
}

function MiniGauge({ value, label, inverse = false }: { value: number; label: string; inverse?: boolean }) {
  const display = Math.round(value);
  const C = 2 * Math.PI * 16;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * C;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-10">
        <svg className="size-10 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" className="stroke-[var(--brand-50)]" />
          <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3" strokeLinecap="round" className={kpiStroke(value, inverse)} strokeDasharray={`${dash} ${C}`} />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center text-[9px] font-bold', kpiText(value, inverse))}>
          {display}
        </span>
      </div>
      <span className="text-[9px] leading-none text-[var(--neutral-400)]">{label}</span>
    </div>
  );
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function phaseBarClass(p: SimulationPhase): string {
  if (p.status === 'COMPLETED') return 'bg-[var(--success-500)]';
  if (p.status === 'ACTIVE') return 'bg-[var(--accent-500)]';
  return 'bg-[var(--brand-100)]';
}

type TabFilter = 'all' | 'IN_PROGRESS' | 'COMPLETED';

export default function SimulationsListPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  // ?statut=COMPLETED preselects a tab (used by the help assistant links).
  const [activeTab, setActiveTab] = useState<TabFilter>(() => {
    const fromUrl = searchParams.get('statut') as TabFilter | null;
    return fromUrl === 'IN_PROGRESS' || fromUrl === 'COMPLETED' ? fromUrl : 'all';
  });

  useEffect(() => {
    setLoading(true);
    setError(null);
    const statusParam = activeTab === 'all' ? undefined : activeTab;
    simulationApi
      .getSimulations(statusParam)
      .then((data) => setSimulations(data))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'IN_PROGRESS', label: 'En cours' },
    { key: 'COMPLETED', label: 'Terminées' },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Tableau de bord', to: '/dashboard' }, { label: 'Simulations' }]}
        title="Mes simulations"
        subtitle="Pilotez vos simulations en cours, lancez-en de nouvelles."
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
        <div className="mb-5 flex items-center gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'cursor-pointer border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                activeTab === t.key
                  ? 'border-[var(--accent-500)] text-[var(--accent-700)]'
                  : 'border-transparent text-[var(--neutral-400)] hover:text-[var(--brand-700)]',
              )}
            >
              {t.label}
              {activeTab === 'all' && t.key === 'all' && (
                <span className="ms-1.5 text-xs text-[var(--neutral-400)]">({simulations.length})</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)}
          </div>
        )}

        {error && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-[var(--error-700)]">Erreur : {error}</p>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab)}
                className="mt-3 cursor-pointer text-sm font-semibold text-[var(--accent-600)] hover:underline"
              >
                Réessayer
              </button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && simulations.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                icon="chart-simple"
                title="Aucune simulation"
                description="Choisissez un scénario et plongez dans l'expérience."
                action={{ label: 'Créer ma première simulation', href: '/simulations/new' }}
              />
            </CardContent>
          </Card>
        )}

        {!loading && !error && simulations.length > 0 && (
          <motion.div
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {simulations.map((sim) => {
              const activePhase = sim.phases?.find((p) => p.status === 'ACTIVE');
              const completedPhases = sim.phases?.filter((p) => p.status === 'COMPLETED').length ?? 0;
              const totalPhases = sim.phases?.length ?? 0;
              const k = sim.kpis as KpiValues | null;
              const statusCfg = STATUS_CONFIG[sim.status] ?? STATUS_CONFIG.DRAFT;
              const sectorIcon = getSectorIcon(sim.scenario?.sector);
              const pendingDecisions = sim.decisions?.filter((d) => d.selectedOption === null).length ?? 0;

              return (
                <motion.div key={sim.id} variants={reduce ? undefined : staggerItem}>
                  <Card
                    className="group cursor-pointer overflow-hidden border-border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-300)] motion-reduce:transform-none"
                    onClick={() => navigate(`/simulations/${sim.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 pb-3">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className={cn('size-1.5 rounded-full', statusCfg.dot)} />
                            <span className={cn('text-xs font-semibold', statusCfg.pill)}>{statusCfg.label}</span>
                          </div>
                          <span className="text-[10px] text-[var(--neutral-400)]">
                            {sim.startedAt ? relativeDate(sim.startedAt) : 'Non démarré'}
                          </span>
                        </div>

                        <h3 className="truncate font-display text-[15px] font-bold text-[var(--brand-700)] transition-colors group-hover:text-[var(--accent-700)]">
                          {sim.project?.name || 'Projet'}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-[var(--neutral-500)]">
                          {sim.scenario?.title || 'Scénario'}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--brand-50)] px-1.5 py-0.5 text-[10px] text-[var(--brand-700)]">
                            <KeenIcon icon={sectorIcon} style="duotone" className="text-[10px] leading-none" />
                            {getSectorLabel(sim.scenario?.sector)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-[var(--brand-50)] px-1.5 py-0.5 text-[10px] text-[var(--brand-700)]">
                            {DIFFICULTY_LABEL[sim.scenario?.difficulty ?? ''] ?? sim.scenario?.difficulty}
                          </span>
                          {pendingDecisions > 0 && (
                            <span className="inline-flex items-center gap-1 rounded bg-[var(--warning-50)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--warning-700)]">
                              {pendingDecisions} décision{pendingDecisions > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-[10px] text-[var(--neutral-400)]">
                            {activePhase ? activePhase.name : completedPhases === totalPhases ? 'Terminé' : 'Phase inconnue'}
                          </span>
                          <span className="text-[10px] font-semibold text-[var(--neutral-400)]">
                            {completedPhases}/{totalPhases}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {sim.phases?.map((phase) => (
                            <div key={phase.order} className={cn('h-1.5 flex-1 rounded-full transition-colors', phaseBarClass(phase))} />
                          ))}
                        </div>
                      </div>

                      {k && (
                        <div className="border-t border-border px-4 pb-4 pt-3">
                          <div className="flex items-center justify-between">
                            <MiniGauge value={k.budget} label="Budget" />
                            <MiniGauge value={k.schedule} label="Délai" />
                            <MiniGauge value={k.quality} label="Qualité" />
                            <MiniGauge value={k.teamMorale} label="Moral" />
                            <MiniGauge value={k.riskLevel} label="Risque" inverse />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
