import { cn } from '@/lib/utils';

export type SparkTone = 'up' | 'down' | 'neutral';

const TONE_STROKE: Record<SparkTone, string> = {
  up: 'var(--success-500)',
  down: 'var(--error-500)',
  neutral: 'var(--neutral-300)',
};

interface SparklineProps {
  data: number[];
  tone: SparkTone;
  height?: number;
  className?: string;
}

export function Sparkline({ data, tone, height = 26, className }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const w = 120;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * (h - 4) - 2; // 2px padding top/bottom
    return `${x},${Math.round(y * 100) / 100}`;
  });

  const d = `M ${points.join(' L ')}`;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
    >
      <path d={d} stroke={TONE_STROKE[tone]} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
