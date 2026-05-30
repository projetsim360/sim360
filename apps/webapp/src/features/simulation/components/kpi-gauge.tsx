import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type KpiKey = 'budget' | 'schedule' | 'quality' | 'teamMorale' | 'riskLevel';

interface KpiGaugeProps {
  kpiKey: KpiKey;
  label: string;
  value: number;
  caption?: string;
  tooltip?: string;
  /** When true, the gauge color logic is inverted (high = bad). Used for `riskLevel`. */
  inverse?: boolean;
}

const STROKE_LEN = 151; // 2 * PI * 24

function toneFor(value: number, inverse: boolean): 'success' | 'warning' | 'error' {
  const v = inverse ? 100 - value : value;
  if (v >= 70) return 'success';
  if (v >= 40) return 'warning';
  return 'error';
}

const TONE_STROKE: Record<'success' | 'warning' | 'error', string> = {
  success: 'var(--success-500)',
  warning: 'var(--warning-500)',
  error: 'var(--error-500)',
};

export function KpiGauge({ kpiKey: _kpiKey, label, value, caption, tooltip, inverse = false }: KpiGaugeProps) {
  // Animate from 0 to value on mount, like the shared Progress does.
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setDisplay(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const tone = toneFor(value, inverse);
  const stroke = TONE_STROKE[tone];
  const dash = (display / 100) * STROKE_LEN;

  const gaugeNode = (
    <div className="flex min-h-[104px] flex-col gap-2 rounded-lg bg-white p-3.5 shadow-[0_2px_4px_rgba(15,26,46,0.06),0_4px_12px_rgba(15,26,46,0.08)]">
      <span className="text-[10px] font-semibold uppercase tracking-[0.8px] text-[var(--neutral-400)]">
        {label}
      </span>
      <div className="flex items-end gap-2.5">
        <div className="relative flex size-14 items-center justify-center">
          <svg className="absolute inset-0" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--brand-50)" strokeWidth="4" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke={stroke}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${STROKE_LEN}`}
              transform="rotate(-90 28 28)"
              className="transition-[stroke-dasharray] duration-700 ease-out motion-reduce:transition-none"
            />
          </svg>
          <span className="font-display text-[14px] font-extrabold text-foreground">
            {Math.round(value)}
          </span>
        </div>
        {caption && (
          <span className="text-[10px] leading-tight text-muted-foreground">{caption}</span>
        )}
      </div>
    </div>
  );

  if (!tooltip) return gaugeNode;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('cursor-help')}>{gaugeNode}</div>
      </TooltipTrigger>
      <TooltipContent variant="light" className="max-w-[260px]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
