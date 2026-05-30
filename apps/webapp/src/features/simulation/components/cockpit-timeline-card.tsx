import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { TimelineEntry } from '../types/simulation.types';

const ENTRY_CONFIG: Record<string, { icon: string; iconClass: string; label: string }> = {
  decision: { icon: 'question-2', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]', label: 'Décision' },
  decision_made: { icon: 'question-2', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]', label: 'Décision' },
  event: { icon: 'flash', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]', label: 'Événement' },
  event_triggered: { icon: 'flash', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]', label: 'Événement' },
  meeting: { icon: 'message-text', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'Réunion' },
  meeting_completed: { icon: 'message-text', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'Réunion' },
  deliverable: { icon: 'document', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'Livrable' },
  phase: { icon: 'check-circle', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'Phase' },
  phase_completed: { icon: 'check-circle', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'Phase' },
  simulation: { icon: 'rocket', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'Simulation' },
};

function shortDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (days === 0) return `Aujourd'hui · ${hh}:${mm}`;
  if (days === 1) return `Hier · ${hh}:${mm}`;
  if (days < 7) return `il y a ${days}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

interface CockpitTimelineCardProps {
  entries: TimelineEntry[];
}

export function CockpitTimelineCard({ entries }: CockpitTimelineCardProps) {
  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <div className="mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
            Historique
          </span>
          <h3 className="font-display text-[17px] font-bold text-foreground">Timeline du projet</h3>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon="time"
            title="Aucune activité"
            description="L'historique apparaîtra ici au fur et à mesure de la simulation."
          />
        ) : (
          <div className="max-h-[320px] space-y-1 overflow-y-auto">
            {entries.map((e, i) => {
              const config = ENTRY_CONFIG[e.type] ?? ENTRY_CONFIG.simulation;
              return (
                <div key={`${e.type}-${e.date}-${i}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30">
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', config.iconClass)}>
                    <KeenIcon icon={config.icon} style="duotone" className="text-sm" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                    {e.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--neutral-400)]">{shortDate(e.date)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
