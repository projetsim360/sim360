import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import type { Decision, RandomEvent, SimulationMeeting } from '../types/simulation.types';

const SEVERITY_TONE: Record<RandomEvent['severity'], string> = {
  LOW: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  MEDIUM: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  HIGH: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  CRITICAL: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

interface ActionItem {
  key: string;
  href: string;
  icon: string;
  iconClass: string;
  label: string;
  meta?: string;
  metaPillClass?: string;
}

interface CockpitActionsCardProps {
  simulationId: string;
  decisions: Decision[];
  events: RandomEvent[];
  meetings: SimulationMeeting[];
}

export function CockpitActionsCard({ simulationId, decisions, events, meetings }: CockpitActionsCardProps) {
  const reduce = useReducedMotion();

  const items: ActionItem[] = [];

  decisions
    .filter((d) => d.selectedOption === null)
    .forEach((d) =>
      items.push({
        key: `d-${d.id}`,
        href: `/simulations/${simulationId}/decisions/${d.id}`,
        icon: 'question-2',
        iconClass: 'bg-[var(--accent-100)] text-[var(--accent-700)]',
        label: d.title,
        meta: 'Décision',
      }),
    );

  events
    .filter((e) => e.selectedOption === null)
    .forEach((e) =>
      items.push({
        key: `e-${e.id}`,
        href: `/simulations/${simulationId}/events/${e.id}`,
        icon: 'flash',
        iconClass: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
        label: e.title,
        meta: e.severity,
        metaPillClass: SEVERITY_TONE[e.severity],
      }),
    );

  meetings
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS')
    .forEach((m) =>
      items.push({
        key: `m-${m.id}`,
        href: `/meetings/${m.id}`,
        icon: 'message-text',
        iconClass: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
        label: m.title,
        meta: m.status === 'IN_PROGRESS' ? 'En cours' : 'Réunion',
      }),
    );

  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
              À traiter
            </span>
            <h3 className="font-display text-[17px] font-bold text-[var(--brand-700)]">
              {items.length} action{items.length > 1 ? 's' : ''} prioritaire{items.length > 1 ? 's' : ''}
            </h3>
          </div>
          <Link to={`/simulations/${simulationId}/decisions`} className="text-[12px] font-semibold text-[var(--accent-600)]">
            Tout voir →
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon="check-circle"
            title="Tout est à jour"
            description="Aucune action en attente pour cette simulation."
          />
        ) : (
          <motion.div
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            {items.map((it) => (
              <motion.div key={it.key} variants={reduce ? undefined : staggerItem}>
                <Link
                  to={it.href}
                  className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 hover:bg-muted/30"
                >
                  <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg', it.iconClass)}>
                    <KeenIcon icon={it.icon} style="duotone" className="text-sm" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--brand-700)]">
                    {it.label}
                  </span>
                  {it.meta && (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                        it.metaPillClass ?? 'bg-[var(--brand-100)] text-[var(--brand-600)]',
                      )}
                    >
                      {it.meta}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
