import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Card, CardContent } from '@/components/ui/card';
import { simulationApi } from '../api/simulation.api';
import type { TimelineEntry } from '../types/simulation.types';

const TYPE_ICONS: Record<string, string> = {
  PHASE_START: '📋',
  PHASE_COMPLETE: '✅',
  DECISION: '🤔',
  RANDOM_EVENT: '⚡',
  SIMULATION_START: '🚀',
  SIMULATION_COMPLETE: '🏁',
  SIMULATION_PAUSE: '⏸',
  SIMULATION_RESUME: '▶',
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

const TYPE_COLORS: Record<string, string> = {
  PHASE_START: 'border-primary/30 bg-primary/5',
  PHASE_COMPLETE: 'border-success/30 bg-success/5',
  DECISION: 'border-primary/30 bg-primary/5',
  RANDOM_EVENT: 'border-[var(--accent-brand)]/30 bg-[var(--accent-brand)]/5',
  SIMULATION_START: 'border-primary/30 bg-primary/5',
  SIMULATION_COMPLETE: 'border-success/30 bg-success/5',
  SIMULATION_PAUSE: 'border-warning/30 bg-warning/5',
  SIMULATION_RESUME: 'border-primary/30 bg-primary/5',
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
    <div className="container">
      <Toolbar>
        <ToolbarHeading title="Historique de la simulation" />
        <ToolbarActions>
          <Link
            to={`/simulations/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            ← Retour a la simulation
          </Link>
        </ToolbarActions>
      </Toolbar>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <span className="text-4xl">📜</span>
            <p className="text-muted-foreground text-sm">
              Aucun evenement dans l'historique.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && timeline.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {timeline.map((entry, i) => {
              const icon = TYPE_ICONS[entry.type] || '📌';
              const label = TYPE_LABELS[entry.type] || entry.type;
              const colorClass = TYPE_COLORS[entry.type] || 'border-border bg-muted';

              return (
                <div key={i} className="relative flex items-start gap-4 pl-12">
                  {/* Dot on the line */}
                  <div
                    className={`absolute left-3 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${colorClass}`}
                  >
                    {icon}
                  </div>

                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                              {label}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium">{entry.title}</h4>
                          {/* Extra data display */}
                          {entry.data && Object.keys(entry.data).length > 0 && (
                            <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                              {Object.entries(entry.data).map(([key, val]) => (
                                <p key={key}>
                                  <span className="font-medium">{key}</span> :{' '}
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                          {new Date(entry.date).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
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
