import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { RecentActivityItem } from '../types/dashboard.types';

const EVENT_CONFIG: Record<string, { icon: string; label: string; iconClass: string }> = {
  decision: { icon: 'question-2', label: 'Décision', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]' },
  meeting: { icon: 'message-text', label: 'Réunion', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]' },
  event: { icon: 'flash', label: 'Événement', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]' },
  deliverable: { icon: 'document', label: 'Livrable', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]' },
  simulation: { icon: 'rocket', label: 'Simulation', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]' },
  email: { icon: 'sms', label: 'Email', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-600)]' },
};

export function RecentActivityCard({
  activities,
  loading,
}: {
  activities: RecentActivityItem[];
  loading: boolean;
}) {
  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          Historique
        </span>
        <h4 className="mb-2 font-display text-[16px] font-bold text-[var(--brand-700)]">Activité récente</h4>

        {loading ? (
          <div className="space-y-2 pt-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon="time"
            title="Aucune activité récente"
            description="Votre historique d'activité apparaîtra ici."
          />
        ) : (
          <div className="max-h-[280px] space-y-1 overflow-y-auto">
            {activities.map((activity) => {
              const config = EVENT_CONFIG[activity.eventType] ?? EVENT_CONFIG.simulation;
              const data = activity.data as Record<string, string>;
              return (
                <div key={activity.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/30">
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', config.iconClass)}>
                    <KeenIcon icon={config.icon} style="duotone" className="text-sm" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[var(--brand-700)]">
                      {data?.title ?? config.label}
                    </p>
                    <p className="text-[10px] text-[var(--neutral-400)]">{data?.projectName ?? ''}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-[var(--neutral-400)]">
                    {new Date(activity.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
