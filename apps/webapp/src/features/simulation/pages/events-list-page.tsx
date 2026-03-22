import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { simulationApi } from '../api/simulation.api';
import type { Simulation, RandomEvent } from '../types/simulation.types';

const SEVERITY_VARIANT: Record<string, 'info' | 'warning' | 'destructive'> = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'warning',
  CRITICAL: 'destructive',
};

const SEVERITY_LABEL: Record<string, string> = {
  LOW: 'Faible',
  MEDIUM: 'Moyen',
  HIGH: 'Eleve',
  CRITICAL: 'Critique',
};

export default function EventsListPage() {
  const { id } = useParams<{ id: string }>();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    simulationApi
      .getSimulation(id)
      .then(setSim)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const events = sim?.randomEvents ?? [];
  const pending = events.filter((e) => e.selectedOption === null);
  const resolved = events.filter((e) => e.selectedOption !== null);

  if (loading) {
    return (
      <div className="container-fixed space-y-5">
        <Toolbar>
          <ToolbarHeading>
            <Skeleton className="h-7 w-56" />
          </ToolbarHeading>
        </Toolbar>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fixed">
        <Toolbar>
          <ToolbarHeading>
            <h1 className="text-xl font-medium text-gray-900">Evenements aleatoires</h1>
          </ToolbarHeading>
        </Toolbar>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-fixed space-y-5">
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">Evenements aleatoires</h1>
          <p className="text-sm text-gray-700">
            {events.length} evenement(s) — {pending.length} en attente, {resolved.length} resolu(s)
          </p>
        </ToolbarHeading>
        <ToolbarActions>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="duotone" className="text-sm" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      {events.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon="flash"
              title="Aucun evenement"
              description="Les evenements aleatoires apparaitront au fil de la simulation."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-warning flex items-center gap-2">
                <KeenIcon icon="flash" style="duotone" className="text-sm" />
                En attente ({pending.length})
              </h2>
              {pending.map((evt) => (
                <EventCard key={evt.id} event={evt} simId={id!} />
              ))}
            </div>
          )}

          {resolved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-success flex items-center gap-2">
                <KeenIcon icon="check-circle" style="duotone" className="text-sm" />
                Resolus ({resolved.length})
              </h2>
              {resolved.map((evt) => (
                <EventCard key={evt.id} event={evt} simId={id!} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EventCard({ event, simId }: { event: RandomEvent; simId: string }) {
  const isResolved = event.selectedOption !== null;

  return (
    <Card className={isResolved ? 'opacity-80' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <KeenIcon icon="flash" style="duotone" className="text-sm text-warning shrink-0" />
              <h3 className="text-sm font-medium truncate">{event.title}</h3>
              <Badge
                variant={SEVERITY_VARIANT[event.severity] ?? 'secondary'}
                appearance="light"
                size="sm"
              >
                {SEVERITY_LABEL[event.severity] ?? event.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {event.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" size="sm">
                Phase {event.phaseOrder + 1}
              </Badge>
              <Badge variant={isResolved ? 'success' : 'warning'} appearance="light" size="sm">
                {isResolved ? 'Resolu' : 'En attente'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Type : {event.type}
              </span>
              {isResolved && event.resolvedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(event.resolvedAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
          <Button variant={isResolved ? 'outline' : 'primary'} size="sm" asChild>
            <Link to={`/simulations/${simId}/events/${event.id}`}>
              {isResolved ? 'Voir' : 'Reagir'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
