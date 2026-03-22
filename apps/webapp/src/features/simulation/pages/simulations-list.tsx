import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { simulationApi } from '../api/simulation.api';
import type { Simulation } from '../types/simulation.types';

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'primary' | 'success' | 'warning' | 'destructive' | 'info'; dot: string }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary', dot: 'bg-gray-400' },
  ONBOARDING: { label: 'Passation', variant: 'info', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'En cours', variant: 'primary', dot: 'bg-brand-500' },
  PAUSED: { label: 'En pause', variant: 'warning', dot: 'bg-amber-500' },
  COMPLETED: { label: 'Terminee', variant: 'success', dot: 'bg-brand-500' },
  ABANDONED: { label: 'Abandonnee', variant: 'destructive', dot: 'bg-destructive' },
};

const SECTOR_ICONS: Record<string, string> = {
  IT: 'technology-2',
  CONSTRUCTION: 'home',
  MARKETING: 'chart-line',
  HEALTHCARE: 'heart',
  FINANCE: 'dollar',
  CUSTOM: 'element-11',
};

function kpiColor(value: number, inverse = false): string {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'text-brand-500';
  if (v >= 40) return 'text-amber-500';
  return 'text-destructive';
}

function kpiBg(value: number, inverse = false): string {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'stroke-brand-500';
  if (v >= 40) return 'stroke-amber-500';
  return 'stroke-destructive';
}

function MiniGauge({ value, label, inverse = false }: { value: number; label: string; inverse?: boolean }) {
  const displayValue = Math.round(value);
  const circumference = 2 * Math.PI * 16;
  const strokeDash = (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
          <circle
            cx="20" cy="20" r="16" fill="none" strokeWidth="3" strokeLinecap="round"
            className={kpiBg(value, inverse)}
            strokeDasharray={`${strokeDash} ${circumference}`}
          />
        </svg>
        <span className={cn('absolute inset-0 flex items-center justify-center text-[9px] font-bold', kpiColor(value, inverse))}>
          {displayValue}
        </span>
      </div>
      <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    </div>
  );
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} sem.`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

type TabFilter = 'all' | 'IN_PROGRESS' | 'COMPLETED';

export default function SimulationsListPage() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const statusParam = activeTab === 'all' ? undefined : activeTab;
    simulationApi
      .getSimulations(statusParam)
      .then((data) => setSimulations(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'Toutes', count: simulations.length },
    { key: 'IN_PROGRESS', label: 'En cours' },
    { key: 'COMPLETED', label: 'Terminees' },
  ];

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">Mes simulations</h1>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="primary" size="sm" asChild>
            <Link to="/simulations/new" className="inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nouvelle simulation
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer',
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {tab.count !== undefined && activeTab === 'all' && tab.key === 'all' && (
                <span className="ml-1.5 text-xs text-muted-foreground">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-destructive text-sm">Erreur : {error}</p>
              <button onClick={() => setActiveTab(activeTab)} className="mt-3 text-sm text-primary hover:underline cursor-pointer">
                Reessayer
              </button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && simulations.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                icon="chart-simple"
                title="Aucune simulation"
                description="Choisissez un scenario et plongez dans l'experience !"
                action={{ label: 'Creer ma premiere simulation', href: '/simulations/new' }}
              />
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {!loading && !error && simulations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {simulations.map((sim) => {
              const activePhase = sim.phases?.find((p) => p.status === 'ACTIVE');
              const completedPhases = sim.phases?.filter((p) => p.status === 'COMPLETED').length ?? 0;
              const totalPhases = sim.phases?.length ?? 0;
              const kpis = sim.kpis;
              const statusCfg = STATUS_CONFIG[sim.status] ?? STATUS_CONFIG.DRAFT;
              const sectorIcon = SECTOR_ICONS[sim.scenario?.sector ?? ''] ?? 'element-11';
              const pendingDecisions = sim.decisions?.filter((d) => d.selectedOption === null).length ?? 0;

              return (
                <Card
                  key={sim.id}
                  className="group cursor-pointer transition-all duration-200 hover:border-brand-500/40"
                  onClick={() => navigate(`/simulations/${sim.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Top section */}
                    <div className="p-4 pb-3">
                      {/* Status + sector + date */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', statusCfg.dot)} />
                          <span className="text-xs font-medium text-muted-foreground">{statusCfg.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {sim.startedAt ? relativeDate(sim.startedAt) : 'Non demarre'}
                        </span>
                      </div>

                      {/* Title + description */}
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-brand-500 transition-colors truncate">
                        {sim.project?.name || 'Projet'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {sim.scenario?.title || 'Scenario'}
                      </p>

                      {/* Metadata badges */}
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                          <KeenIcon icon={sectorIcon} style="duotone" className="text-[10px] leading-none" />
                          {sim.scenario?.sector}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                          {sim.scenario?.difficulty === 'BEGINNER' ? 'Debutant' : sim.scenario?.difficulty === 'INTERMEDIATE' ? 'Intermediaire' : 'Avance'}
                        </span>
                        {pendingDecisions > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-600 font-medium">
                            {pendingDecisions} decision{pendingDecisions > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phase progress */}
                    <div className="px-4 pb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-muted-foreground">
                          {activePhase ? activePhase.name : completedPhases === totalPhases ? 'Termine' : 'Phase inconnue'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {completedPhases}/{totalPhases}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {sim.phases?.map((phase) => (
                          <div
                            key={phase.order}
                            className={cn(
                              'h-1.5 flex-1 rounded-full transition-colors',
                              phase.status === 'COMPLETED' ? 'bg-brand-500' :
                              phase.status === 'ACTIVE' ? 'bg-brand-500' :
                              'bg-gray-100 dark:bg-gray-800',
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* KPIs compact */}
                    {kpis && (
                      <div className="px-4 pb-4 pt-1 border-t border-border">
                        <div className="flex items-center justify-between pt-3">
                          <MiniGauge value={kpis.budget} label="Budget" />
                          <MiniGauge value={kpis.schedule} label="Delai" />
                          <MiniGauge value={kpis.quality} label="Qualite" />
                          <MiniGauge value={kpis.teamMorale} label="Moral" />
                          <MiniGauge value={kpis.riskLevel} label="Risque" inverse />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
