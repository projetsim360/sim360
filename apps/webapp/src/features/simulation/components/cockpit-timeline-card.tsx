import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { TimelineEntry } from '../types/simulation.types';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useAppLocale } from '@/providers/locale-provider';
import { relativeDateTime } from '@/i18n/app/format';
import { useT } from '@/i18n/app/use-t';

const ENTRY_CONFIG: Record<string, { icon: string; iconClass: string; label: AppMessageKey }> = {
  decision: { icon: 'question-2', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]', label: 'dashboard.activity.decision' },
  decision_made: { icon: 'question-2', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]', label: 'dashboard.activity.decision' },
  event: { icon: 'flash', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]', label: 'dashboard.activity.event' },
  event_triggered: { icon: 'flash', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]', label: 'dashboard.activity.event' },
  meeting: { icon: 'message-text', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'dashboard.activity.meeting' },
  meeting_completed: { icon: 'message-text', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'dashboard.activity.meeting' },
  deliverable: { icon: 'document', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'dashboard.activity.deliverable' },
  phase: { icon: 'check-circle', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'timeline.phase' },
  phase_completed: { icon: 'check-circle', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]', label: 'timeline.phase' },
  simulation: { icon: 'rocket', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]', label: 'dashboard.activity.simulation' },
};

interface CockpitTimelineCardProps {
  entries: TimelineEntry[];
}

export function CockpitTimelineCard({ entries }: CockpitTimelineCardProps) {
  const { intlLocale } = useAppLocale();
  const t = useT();
  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <div className="mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[1px] text-muted-foreground">
            {t('dashboard.activity.kicker')}
          </span>
          <h3 className="font-display text-[17px] font-bold text-foreground">{t('timeline.title')}</h3>
        </div>

        {entries.length === 0 ? (
          <EmptyState
            icon="time"
            title={t('timeline.emptyTitle')}
            description={t('timeline.emptyText')}
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
                  <span className="shrink-0 text-[10px] text-muted-foreground">{relativeDateTime(e.date, intlLocale)}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
