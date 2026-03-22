import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { simulationApi } from '@/features/simulation/api/simulation.api';

interface SimulationSummary {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  scenario: { id: string; title: string; difficulty: string; sector: string };
  project: { id: string; name: string; client: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'secondary' | 'primary' | 'success' | 'warning' | 'destructive' | 'info' }> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  ONBOARDING: { label: 'Passation', variant: 'info' },
  IN_PROGRESS: { label: 'En cours', variant: 'primary' },
  PAUSED: { label: 'En pause', variant: 'warning' },
  COMPLETED: { label: 'Terminee', variant: 'success' },
  ABANDONED: { label: 'Abandonnee', variant: 'destructive' },
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Debutant',
  INTERMEDIATE: 'Intermediaire',
  ADVANCED: 'Avance',
};

const SECTOR_ICONS: Record<string, string> = {
  IT: 'technology-2',
  CONSTRUCTION: 'home',
  MARKETING: 'chart-line',
  HEALTHCARE: 'heart',
  FINANCE: 'dollar',
  CUSTOM: 'element-11',
};

export default function PortfolioListPage() {
  const [simulations, setSimulations] = useState<SimulationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    simulationApi
      .getSimulations()
      .then((data) => {
        setSimulations(data as SimulationSummary[]);
      })
      .catch(() => {
        setError('Impossible de charger vos simulations.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">Portfolio</h1>
            <p className="text-sm text-gray-700">Selectionnez une simulation pour consulter son portfolio</p>
          </ToolbarHeading>
        </Toolbar>
        <div className="container-fixed">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">Portfolio</h1>
            <p className="text-sm text-gray-700">Selectionnez une simulation pour consulter son portfolio</p>
          </ToolbarHeading>
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-700">Selectionnez une simulation pour consulter son portfolio</p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/badges">
              <KeenIcon icon="award" style="duotone" className="text-sm" />
              Mes badges
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>
      <div className="container-fixed">
        {simulations.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="briefcase"
                title="Aucune simulation"
                description="Vous n'avez pas encore de simulation. Lancez une simulation pour construire votre portfolio."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {simulations.map((sim) => {
              const statusCfg = STATUS_CONFIG[sim.status] ?? { label: sim.status, variant: 'secondary' as const };
              const sectorIcon = SECTOR_ICONS[sim.scenario.sector] ?? 'element-11';

              return (
                <Card key={sim.id} className="flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 shrink-0">
                          <KeenIcon icon={sectorIcon} style="duotone" className="text-base text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">
                            {sim.project.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {sim.scenario.title}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusCfg.variant} appearance="light" size="sm" className="shrink-0">
                        {statusCfg.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {sim.project.client && (
                        <span className="flex items-center gap-1">
                          <KeenIcon icon="profile-circle" style="duotone" className="text-xs" />
                          {sim.project.client}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <KeenIcon icon="chart" style="duotone" className="text-xs" />
                        {DIFFICULTY_LABELS[sim.scenario.difficulty] ?? sim.scenario.difficulty}
                      </span>
                    </div>

                    {sim.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Terminee le{' '}
                        {new Date(sim.completedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    )}

                    <div className="mt-auto pt-2">
                      <Button variant="primary" size="sm" asChild className="w-full">
                        <Link to={`/simulations/${sim.id}/portfolio`}>
                          <KeenIcon icon="briefcase" style="duotone" className="text-sm" />
                          Voir le portfolio
                        </Link>
                      </Button>
                    </div>
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
