import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { computeMeetingTimeline } from '../lib/meeting-timeline';

interface MeetingTimelineChipProps {
  elapsedSeconds: number;
  durationMinutes?: number | null;
  className?: string;
}

/** Elapsed / planned duration with a progress bar ("05 min / 60 min", "Reste 55 min"). */
export function MeetingTimelineChip({ elapsedSeconds, durationMinutes, className }: MeetingTimelineChipProps) {
  const t = computeMeetingTimeline(elapsedSeconds, durationMinutes);
  const nearEnd = t.progress !== null && t.progress >= 0.85 && !t.overtime;

  return (
    <div
      role="timer"
      aria-label={t.remainingLabel ? `${t.label}, ${t.remainingLabel}` : t.label}
      className={cn('inline-flex min-w-[140px] flex-col gap-1 rounded-lg bg-white/10 px-2.5 py-1.5', className)}
    >
      <div className="flex items-center justify-between gap-2 text-xs font-medium text-white tabular-nums">
        <span className="inline-flex items-center gap-1.5">
          <KeenIcon icon="time" style="duotone" className="text-xs leading-none" />
          {t.label}
        </span>
        {t.remainingLabel && (
          <span
            className={cn(
              'hidden sm:inline text-[10px] font-semibold',
              t.overtime ? 'text-[#FCA5A5]' : nearEnd ? 'text-[var(--warning-300,#FCD34D)]' : 'text-white/60',
            )}
          >
            {t.remainingLabel}
          </span>
        )}
      </div>
      {t.progress !== null && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-700',
              t.overtime ? 'bg-[var(--error-500)]' : nearEnd ? 'bg-[var(--warning-500)]' : 'bg-[var(--accent-500)]',
            )}
            style={{ width: `${Math.round(t.progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
