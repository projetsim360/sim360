import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { simulationApi } from '../api/simulation.api';
import type { TimelineEntry } from '../types/simulation.types';

const TYPE_ICONS: Record<string, string> = {
  PHASE_START: 'notepad',
  PHASE_COMPLETE: 'check-circle',
  DECISION: 'question-2',
  RANDOM_EVENT: 'flash',
  SIMULATION_START: 'rocket',
  SIMULATION_COMPLETE: 'flag',
  SIMULATION_PAUSE: 'time',
  SIMULATION_RESUME: 'arrow-right',
};

const TYPE_LABELS: Record<string, string> = {
  PHASE_START: 'Debut de phase',
  PHASE_COMPLETE: 'Phase terminee',
  DECISION: 'Decision',
  RANDOM_EVENT: 'Evenement aleatoire',
  SIMULATION_START: 'Debut de simulation',
  SIMULATION_COMPLETE: 'Simulation terminee',
  SIMULATION_PAUSE: 'Simulation en pause',
  SIMULATION_RESUME: 'Simulation reprise',
};

const TYPE_DOT_COLORS: Record<string, string> = {
  PHASE_START: 'bg-primary/15 text-primary border-primary/30',
  PHASE_COMPLETE: 'bg-success/15 text-success border-success/30',
  DECISION: 'bg-primary/15 text-primary border-primary/30',
  RANDOM_EVENT: 'bg-warning/15 text-warning border-warning/30',
  SIMULATION_START: 'bg-primary/15 text-primary border-primary/30',
  SIMULATION_COMPLETE: 'bg-success/15 text-success border-success/30',
  SIMULATION_PAUSE: 'bg-warning/15 text-warning border-warning/30',
  SIMULATION_RESUME: 'bg-primary/15 text-primary border-primary/30',
};

const TYPE_BADGE_VARIANT: Record<string, 'primary' | 'success' | 'warning' | 'secondary'> = {
  PHASE_START: 'primary',
  PHASE_COMPLETE: 'success',
  DECISION: 'primary',
  RANDOM_EVENT: 'warning',
  SIMULATION_START: 'primary',
  SIMULATION_COMPLETE: 'success',
  SIMULATION_PAUSE: 'warning',
  SIMULATION_RESUME: 'primary',
};

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>();
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    simulationApi
      .getTimeline(id)
      .then((data) => setTimeline(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="container-fixed space-y-5">
      <Toolbar>
        <ToolbarHeading>
          <h1 className="text-xl font-medium text-gray-900">Historique de la simulation</h1>
          {!loading && timeline.length > 0 && (
            <p className="text-sm text-gray-700">{timeline.length} evenement(s)</p>
          )}
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

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 pl-12 relative">
              <Skeleton className="absolute left-3 w-7 h-7 rounded-full" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive text-sm">Erreur : {error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && timeline.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon="calendar"
              title="Aucun evenement"
              description="L'historique se construira au fil de la simulation."
            />
          </CardContent>
        </Card>
      )}

      {!loading && !error && timeline.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-border" aria-hidden="true" />

          <div className="space-y-3">
            {timeline.map((entry, i) => {
              const icon = TYPE_ICONS[entry.type] || 'element-11';
              const label = TYPE_LABELS[entry.type] || entry.type;
              const dotColor = TYPE_DOT_COLORS[entry.type] || 'bg-muted text-muted-foreground border-border';
              const badgeVariant = TYPE_BADGE_VARIANT[entry.type] || 'secondary';

              return (
                <div key={i} className="relative flex items-start gap-3 pl-12">
                  {/* Dot on the line */}
                  <div
                    className={`absolute left-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center ${dotColor}`}
                  >
                    <KeenIcon icon={icon} style="duotone" className="text-[10px]" />
                  </div>

                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={badgeVariant} appearance="light" size="sm">
                              {label}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-medium text-foreground">{entry.title}</h4>
                          {entry.data && Object.keys(entry.data).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                              {Object.entries(entry.data).map(([key, val]) => (
                                <p key={key}>
                                  <span className="font-medium">{key}</span> :{' '}
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                          {new Date(entry.date).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
