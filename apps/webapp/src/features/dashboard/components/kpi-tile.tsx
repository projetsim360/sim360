import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { staggerItem } from '@/lib/motion';
import { Sparkline, type SparkTone } from './sparkline';

interface KpiTileProps {
  label: string;
  value: string;
  suffix?: string;
  delta?: number | null;
  deltaLabel?: string;
  tone?: SparkTone;
  series?: number[];
  index?: number;
}

const TONE_TEXT: Record<SparkTone, string> = {
  up: 'text-[var(--success-700)]',
  down: 'text-[var(--error-700)]',
  neutral: 'text-[var(--neutral-400)]',
};

const TONE_ARROW: Record<SparkTone, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export function KpiTile({
  label,
  value,
  suffix,
  delta,
  deltaLabel,
  tone = 'neutral',
  series,
  index = 0,
}: KpiTileProps) {
  const reduce = useReducedMotion();

  // Build the delta caption: prefer a real delta, otherwise the factual label.
  let caption: string | null = null;
  if (delta != null && delta !== 0) {
    caption = `${TONE_ARROW[tone]} ${Math.abs(delta)}`;
  } else if (deltaLabel) {
    caption = deltaLabel;
  } else if (delta === 0) {
    caption = '→ stable';
  }

  return (
    <motion.div
      variants={reduce ? undefined : staggerItem}
      custom={index}
      className="flex min-h-[128px] flex-col rounded-lg bg-white p-4 shadow-[0_2px_4px_rgba(15,26,46,0.06),0_4px_12px_rgba(15,26,46,0.08)]"
    >
      <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
        {label}
      </span>
      <span className="mt-1.5 font-display text-[34px] font-extrabold leading-none tracking-[-0.02em] text-[var(--brand-700)]">
        {value}
        {suffix && <span className="text-[18px] text-[var(--neutral-300)]">{suffix}</span>}
      </span>
      {caption && (
        <span className={cn('mt-2 text-xs font-semibold', TONE_TEXT[tone])}>{caption}</span>
      )}
      {series && series.length >= 2 && (
        <div className="mt-auto pt-2">
          <Sparkline data={series} tone={tone} />
        </div>
      )}
    </motion.div>
  );
}
