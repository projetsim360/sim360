import { cn } from '@/lib/utils';
import type { SimulationPhase } from '../types/simulation.types';

interface CockpitPhaseStripProps {
  phases: SimulationPhase[];
}

export function CockpitPhaseStrip({ phases }: CockpitPhaseStripProps) {
  if (!phases || phases.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-lg border border-border bg-white px-3 py-2.5">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
        Phases
      </span>
      {phases.map((phase) => {
        const done = phase.status === 'COMPLETED';
        const active = phase.status === 'ACTIVE';
        return (
          <div key={phase.order} className="flex shrink-0 items-center gap-2">
            <div
              className={cn(
                'h-1.5 w-10 rounded-full transition-colors',
                done
                  ? 'bg-[var(--success-500)]'
                  : active
                    ? 'bg-[var(--accent-500)]'
                    : 'bg-[var(--brand-100)]',
              )}
            />
            <span
              className={cn(
                'whitespace-nowrap text-[11px] font-semibold',
                done
                  ? 'text-[var(--success-700)]'
                  : active
                    ? 'text-[var(--accent-700)]'
                    : 'text-[var(--neutral-400)]',
              )}
            >
              {done ? '✓ ' : active ? '● ' : ''}
              {phase.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
