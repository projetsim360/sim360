import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortfolio } from '../api/valorization.api';
import { PortfolioDeliverableCard } from '../components/portfolio-deliverable-card';

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePortfolio(id!);

  if (isLoading) {
    return (
      <div className="container space-y-5">
        <Toolbar>
          <ToolbarHeading title="Portfolio" />
        </Toolbar>
        {/* Simulation info header skeleton */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="size-14 rounded-full shrink-0" />
            </div>
          </CardContent>
        </Card>
        {/* Deliverable cards skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container">
        <Toolbar>
          <ToolbarHeading title="Portfolio" />
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">
              Impossible de charger le portfolio.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container space-y-5">
      <Toolbar>
        <ToolbarHeading title="Portfolio" />
        <ToolbarActions>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info('Preparation de l\'export PDF...');
              window.print();
            }}
          >
            <KeenIcon icon="download" style="duotone" className="text-sm" />
            Exporter en PDF
          </Button>
        </ToolbarActions>
      </Toolbar>
        {/* Simulation info header */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {data.simulation.project.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {data.simulation.scenario.title} — Client : {data.simulation.project.client}
                </p>
                {data.completedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Termine le{' '}
                    {new Date(data.completedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary font-bold text-lg">
                {data.globalScore}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deliverables list */}
        {data.deliverables.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon="briefcase"
                title="Portfolio vide"
                description="Votre portfolio se construit avec vos meilleurs livrables. Soumettez et faites evaluer vos livrables."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.deliverables.map((deliverable) => (
              <PortfolioDeliverableCard
                key={deliverable.id}
                deliverable={deliverable}
              />
            ))}
          </div>
        )}

        {/* Lecons apprises (US-7.11) */}
        {data.deliverables.filter(
          (d) => d.type === 'closure-report' || d.type === 'lessons-learned',
        ).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeenIcon icon="notepad" style="duotone" className="text-base text-primary" />
                Lecons apprises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.deliverables
                .filter(
                  (d) => d.type === 'closure-report' || d.type === 'lessons-learned',
                )
                .map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                  >
                    <KeenIcon icon="document" style="duotone" className="text-sm text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">{deliverable.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={deliverable.status === 'COMPLETED' ? 'success' : 'warning'}
                          appearance="light"
                          size="sm"
                        >
                          {deliverable.status === 'COMPLETED' ? 'Termine' : deliverable.status}
                        </Badge>
                        {deliverable.grade && (
                          <span className="text-sm font-medium text-muted-foreground">
                            Note : {deliverable.grade}
                          </span>
                        )}
                      </div>
                      {deliverable.content && (
                        <p className="text-sm text-foreground mt-2 whitespace-pre-wrap line-clamp-4">
                          {deliverable.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-3 pb-5 print:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/debriefing`}>
              <KeenIcon icon="chart" style="duotone" className="text-sm" />
              Voir le debriefing
            </Link>
          </Button>
        </div>
    </div>
  );
}
