import { useParams, Link } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { usePortfolio } from '../api/valorization.api';
import { PortfolioDeliverableCard } from '../components/portfolio-deliverable-card';

export default function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = usePortfolio(id!);

  if (isLoading) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Portfolio" />
        </Toolbar>
        <div className="container-fixed">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Toolbar>
          <ToolbarHeading title="Portfolio" />
        </Toolbar>
        <div className="container-fixed">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-destructive">
                Impossible de charger le portfolio.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Portfolio" />
        <ToolbarActions>
          <Button variant="outline" size="sm" disabled>
            <KeenIcon icon="download" style="solid" className="text-sm" />
            Exporter en PDF
          </Button>
          <Button variant="outline" size="sm" disabled>
            <KeenIcon icon="download" style="solid" className="text-sm" />
            Exporter en ZIP
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed space-y-5">
        {/* Simulation info header */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900">
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
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <KeenIcon icon="folder" style="solid" className="text-3xl text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucun livrable dans ce portfolio.
              </p>
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

        {/* Navigation */}
        <div className="flex justify-center gap-3 pb-5">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}/debriefing`}>
              <KeenIcon icon="chart" style="solid" className="text-sm" />
              Voir le debriefing
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
