import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/* Animation primitives, sober per design-system rules:
   - entrance = translateY 8–16px + fade, no bounce, no scale > 1.02
   - prefers-reduced-motion respected (only fades remain) */

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** y-translate distance in px (default 16). */
  offset?: number;
  as?: 'div' | 'section' | 'header' | 'span';
}

/** Fade + translate-up when entering the viewport. Single-shot. */
export function Reveal({ children, className, delay = 0, offset = 16, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}
