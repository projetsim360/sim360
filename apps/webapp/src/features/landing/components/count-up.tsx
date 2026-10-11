import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { intlLocale } from '@/i18n/public-locale';
import { usePublicLocale } from '../hooks/use-public-locale';

/**
 * Count-up number animation when in view. Not used on the landing today: the fictitious
 * figures were removed (roadmap D1). Kept for the day real numbers exist.
 */
export function CountUp({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const locale = intlLocale(usePublicLocale());
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1200, bounce: 0 });
  const display = useTransform(spring, (latest) => `${prefix}${Math.round(latest).toLocaleString(locale)}${suffix}`);

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  return <motion.span ref={ref}>{reduced ? `${prefix}${value.toLocaleString(locale)}${suffix}` : display}</motion.span>;
}
