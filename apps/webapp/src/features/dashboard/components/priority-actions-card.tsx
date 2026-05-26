import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { PendingActions } from '../types/dashboard.types';

interface ActionItem {
  key: keyof PendingActions;
  icon: string;
  label: string;
  link: string;
  iconClass: string;
}

const ITEMS: ActionItem[] = [
  { key: 'decisions', icon: 'question-2', label: 'Décisions', link: '/simulations', iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]' },
  { key: 'events', icon: 'flash', label: 'Événements', link: '/simulations', iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]' },
  { key: 'meetings', icon: 'message-text', label: 'Réunions', link: '/simulations', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]' },
  { key: 'emails', icon: 'sms', label: 'Emails non lus', link: '/emails', iconClass: 'bg-[var(--brand-100)] text-[var(--brand-600)]' },
  { key: 'deliverables', icon: 'document', label: 'Livrables', link: '/deliverables', iconClass: 'bg-[var(--success-50)] text-[var(--success-700)]' },
];

export function PriorityActionsCard({
  actions,
  loading,
}: {
  actions: PendingActions | null;
  loading: boolean;
}) {
  const visible = actions ? ITEMS.filter((it) => actions[it.key] > 0) : [];
  const total = actions ? ITEMS.reduce((sum, it) => sum + actions[it.key], 0) : 0;

  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-4">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          À traiter
        </span>
        <h4 className="mb-2 font-display text-[16px] font-bold text-[var(--brand-700)]">
          {total} action{total > 1 ? 's' : ''} prioritaire{total > 1 ? 's' : ''}
        </h4>

        {loading ? (
          <div className="space-y-2 pt-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-9 rounded-lg" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-[var(--success-50)]">
              <KeenIcon icon="check-circle" style="duotone" className="text-lg text-[var(--success-700)]" />
            </div>
            <p className="text-sm font-medium text-[var(--brand-700)]">Tout est à jour</p>
          </div>
        ) : (
          <div>
            {visible.map((it) => (
              <Link
                key={it.key}
                to={it.link}
                className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 hover:bg-muted/30"
              >
                <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', it.iconClass)}>
                  <KeenIcon icon={it.icon} style="duotone" className="text-sm" />
                </span>
                <span className="flex-1 text-[13px] font-semibold text-[var(--brand-700)]">{it.label}</span>
                <span className="rounded-full bg-[var(--brand-100)] px-2 py-0.5 text-[11px] font-bold text-[var(--brand-600)]">
                  {actions![it.key]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
