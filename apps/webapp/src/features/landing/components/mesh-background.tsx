import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Blob {
  className: string;
  x: number[];
  y: number[];
  duration: number;
}

/* Three blurred colour fields drifting slowly behind the hero. Pure transforms (GPU), no canvas. */
const BLOBS: Blob[] = [
  { className: 'left-[55%] top-[-10%] size-[520px] bg-[var(--accent-500)]/25', x: [0, 40, -20, 0], y: [0, 30, 60, 0], duration: 22 },
  { className: 'left-[-10%] top-[30%] size-[460px] bg-[var(--brand-500)]/30', x: [0, 50, 10, 0], y: [0, -40, 20, 0], duration: 26 },
  { className: 'left-[70%] top-[55%] hidden size-[380px] bg-violet-500/20 sm:block', x: [0, -60, -20, 0], y: [0, -30, 10, 0], duration: 20 },
];

/** Animated mesh gradient. Static when the user prefers reduced motion. */
export function MeshBackground({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {BLOBS.map((blob, i) => (
        <motion.span
          key={i}
          className={cn('absolute rounded-full blur-3xl will-change-transform', blob.className)}
          animate={reduced ? undefined : { x: blob.x, y: blob.y }}
          transition={{ duration: blob.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
    </div>
  );
}
