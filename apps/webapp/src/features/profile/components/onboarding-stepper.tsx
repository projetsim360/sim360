import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check } from '@/components/keenicons/icons';
import type { OnboardingStep, StepperItem } from '../config/onboarding.config';

interface OnboardingStepperProps {
  items: StepperItem[];
  orientation: 'vertical' | 'horizontal';
  onStepClick?: (step: OnboardingStep) => void;
}

function Dot({ item, compact }: { item: StepperItem; compact?: boolean }) {
  const size = compact ? 'size-3.5 text-[8px]' : 'size-[34px] text-sm';
  if (item.isCompleted && !item.isCurrent) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-[var(--success-500)] font-bold text-white',
          size,
        )}
      >
        {!compact && <Check className="text-base" />}
      </span>
    );
  }
  if (item.isCurrent) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full bg-[var(--accent-500)] font-bold text-white',
          size,
        )}
        style={{ boxShadow: '0 0 0 5px rgba(238,122,58,.22)' }}
      >
        {item.displayNumber ?? ''}
      </span>
    );
  }
  if (item.isConditional && !item.isActive) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border-[1.5px] border-dashed border-[var(--accent-300)] font-bold text-[var(--accent-300)]',
          size,
        )}
      >
        ★
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-white/20 bg-white/[0.07] font-bold text-[var(--brand-300)]',
        size,
      )}
    >
      {item.displayNumber ?? ''}
    </span>
  );
}

export function OnboardingStepper({ items, orientation, onStepClick }: OnboardingStepperProps) {
  const handleKeyDown = useCallback(
    (item: StepperItem) => (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && item.isActive && !item.isConditional) {
        e.preventDefault();
        onStepClick?.(item.key);
      }
    },
    [onStepClick],
  );

  if (orientation === 'horizontal') {
    return (
      <nav aria-label="Étapes de l'onboarding" className="flex items-center gap-1.5">
        {items.map((item, i) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <Dot item={item} compact />
            {i < items.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'h-0.5 w-5 rounded-full',
                  item.isCompleted ? 'bg-[var(--success-500)]' : 'bg-white/16',
                )}
              />
            )}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="Étapes de l'onboarding" className="flex flex-col">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const clickable = item.isActive && !item.isConditional;
        return (
          <div key={item.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-current={item.isCurrent ? 'step' : undefined}
                aria-label={`${item.shortLabel}${item.isCurrent ? ' (en cours)' : item.isCompleted ? ' (terminée)' : ''}`}
                onClick={clickable ? () => onStepClick?.(item.key) : undefined}
                onKeyDown={handleKeyDown(item)}
                className={cn(
                  'rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-900)]',
                  clickable && 'cursor-pointer',
                )}
              >
                <Dot item={item} />
              </div>
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    'my-1 min-h-[26px] w-0.5 flex-1 rounded-full',
                    item.isCompleted ? 'bg-[var(--success-500)]' : 'bg-white/[0.13]',
                  )}
                />
              )}
            </div>
            <div className="pb-5 pt-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[13.5px] font-semibold',
                    item.isCurrent
                      ? 'text-white'
                      : item.isActive
                        ? 'text-[var(--brand-200)]'
                        : 'text-[var(--brand-300)]',
                  )}
                >
                  {item.shortLabel}
                </span>
                {item.isConditional && !item.isActive && (
                  <span className="rounded-full border border-[var(--accent-300)]/40 px-2 py-px text-[9.5px] font-bold uppercase tracking-wide text-[var(--accent-300)]">
                    si débutant
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-[11.5px] text-[var(--brand-300)]">{item.railSubtitle}</div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
