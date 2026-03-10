import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { simulationApi } from '../api/simulation.api';
import type { Simulation } from '../types/simulation.types';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  IN_PROGRESS: 'En cours',
  PAUSED: 'En pause',
  COMPLETED: 'Terminee',
  ABANDONED: 'Abandonnee',
};

const STATUS_VARIANT: Record<string, 'secondary' | 'primary' | 'success' | 'warning' | 'destructive'> = {
  DRAFT: 'secondary',
  IN_PROGRESS: 'primary',
  PAUSED: 'warning',
  COMPLETED: 'success',
  ABANDONED: 'destructive',
};

function kpiColor(value: number): string {
  if (value > 70) return 'bg-success';
  if (value >= 40) return 'bg-warning';
  return 'bg-destructive';
}

function KpiBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-16 text-muted-foreground truncate">{label}</span>
      <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${kpiColor(value)}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="w-8 text-right font-medium">{value}%</span>
    </div>
  );
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

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: 'IN_PROGRESS', label: 'En cours' },
    { key: 'COMPLETED', label: 'Terminees' },
  ];

  return (
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Mes simulations" />
        <ToolbarActions>
          <Link
            to="/simulations/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <span>+</span>
            Nouvelle simulation
          </Link>
        </ToolbarActions>
      </Toolbar>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">Erreur : {error}</p>
            <button
              onClick={() => setActiveTab(activeTab)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Reessayer
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
              description="Choisissez un scenario et plongez dans l'experience !"
              action={{ label: 'Creer ma premiere simulation', href: '/simulations/new' }}
            />
          </CardContent>
        </Card>
      )}

      {!loading && !error && simulations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {simulations.map((sim) => {
            const activePhase = sim.phases?.find((p) => p.status === 'ACTIVE');
            const kpis = sim.kpis;

            return (
              <Card
                key={sim.id}
                className="cursor-pointer shadow-none hover:shadow-sm transition-shadow duration-200"
                onClick={() => navigate(`/simulations/${sim.id}`)}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {sim.project?.name || 'Projet'}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {sim.scenario?.title || 'Scenario'}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[sim.status] || 'secondary'} appearance="light" size="sm">
                      {STATUS_LABELS[sim.status] || sim.status}
                    </Badge>
                  </div>

                  {/* Current phase */}
                  {activePhase && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Phase :</span>
                      <span className="font-medium">{activePhase.name}</span>
                    </div>
                  )}

                  {/* Phase progress dots */}
                  {sim.phases && sim.phases.length > 0 && (
                    <div className="flex items-center gap-1">
                      {sim.phases.map((phase) => (
                        <div
                          key={phase.order}
                          className={`h-2 flex-1 rounded-full ${
                            phase.status === 'COMPLETED'
                              ? 'bg-success'
                              : phase.status === 'ACTIVE'
                                ? 'bg-primary'
                                : 'bg-accent'
                          }`}
                          title={`${phase.name} - ${phase.status}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* KPIs */}
                  {kpis && (
                    <div className="space-y-1.5">
                      <KpiBar label="Budget" value={kpis.budget} />
                      <KpiBar label="Delai" value={kpis.schedule} />
                      <KpiBar label="Qualite" value={kpis.quality} />
                      <KpiBar label="Moral" value={kpis.teamMorale} />
                      <KpiBar label="Risque" value={kpis.riskLevel} />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-1 border-t border-border">
                    <span>
                      {sim.startedAt
                        ? `Debut : ${new Date(sim.startedAt).toLocaleDateString('fr-FR')}`
                        : 'Non demarre'}
                    </span>
                    {sim.completedAt && (
                      <span>
                        Fin : {new Date(sim.completedAt).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
