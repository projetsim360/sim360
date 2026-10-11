import { cn } from '@/lib/utils';
import { useT } from '@/i18n/app/use-t';

interface ScenarioPhaseStripProps {
  phases: { id: string; name: string; order: number }[];
  scenarioType: 'GREENFIELD' | 'BROWNFIELD';
  startingPhaseOrder: number;
}

type PhaseState = 'done' | 'start' | 'future';

function phaseState(
  order: number,
  scenarioType: 'GREENFIELD' | 'BROWNFIELD',
  startingPhaseOrder: number,
  firstOrder: number,
): PhaseState {
  if (scenarioType === 'BROWNFIELD') {
    if (order < startingPhaseOrder) return 'done';
    if (order === startingPhaseOrder) return 'start';
    return 'future';
  }
  // GREENFIELD: first phase is the start, the rest are future.
  return order === firstOrder ? 'start' : 'future';
}

const SEG_CLASS: Record<PhaseState, string> = {
  done: 'bg-[var(--success-500)]',
  start: 'bg-[var(--accent-500)]',
  future: 'bg-[var(--brand-100)]',
};

const LABEL_CLASS: Record<PhaseState, string> = {
  done: 'text-[var(--success-700)]',
  start: 'text-[var(--accent-700)]',
  future: 'text-[var(--neutral-400)]',
};

const PREFIX: Record<PhaseState, string> = {
  done: '✓ ',
  start: '● ',
  future: '',
};

export function ScenarioPhaseStrip({ phases, scenarioType, startingPhaseOrder }: ScenarioPhaseStripProps) {
  const t = useT();
  if (!phases || phases.length === 0) return null;
  const sorted = [...phases].sort((a, b) => a.order - b.order);
  const firstOrder = sorted[0]?.order ?? 0;

  return (
    <div>
      <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
        {t('scenario.flow')}
        {scenarioType === 'BROWNFIELD' && (
          <span className="ms-1.5 font-medium normal-case tracking-normal text-[var(--accent-700)]">
            {t('scenario.flowStart', { n: startingPhaseOrder + 1 })}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {sorted.map((phase) => {
          const state = phaseState(phase.order, scenarioType, startingPhaseOrder, firstOrder);
          return (
            <div key={phase.id} className="flex shrink-0 items-center gap-2">
              <div className={cn('h-2 w-12 rounded-full', SEG_CLASS[state])} />
              <span className={cn('whitespace-nowrap text-[11px] font-semibold', LABEL_CLASS[state])}>
                {PREFIX[state]}
                {phase.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
