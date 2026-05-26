import type { Variants } from 'framer-motion';

/** Container that reveals its children one-by-one. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Child item: fades + slides up. Pair with `staggerContainer`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

/** whileHover preset — subtle lift. */
export const cardHover = { y: -2, transition: { duration: 0.15 } };

/** whileTap preset — subtle press. */
export const cardTap = { scale: 0.98 };
