import { motion, useReducedMotion } from 'framer-motion';
import { SKILL_LEVEL_LABELS } from '../types/profile.types';
import type { SkillLevel } from '../types/profile.types';

const LEVEL_PCT: Record<SkillLevel, number> = {
  none: 4,
  basic: 33,
  intermediate: 66,
  advanced: 100,
};

interface SkillDeltaBarProps {
  name: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  /** Stagger index for entrance delay. */
  index?: number;
}

export function SkillDeltaBar({ name, currentLevel, targetLevel, index = 0 }: SkillDeltaBarProps) {
  const reduce = useReducedMotion();
  const cur = LEVEL_PCT[currentLevel];
  const target = LEVEL_PCT[targetLevel];
  const gap = Math.max(0, target - cur);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[13.5px] font-semibold text-foreground">{name}</span>
        <span className="text-[11.5px] font-medium text-muted-foreground">
          {SKILL_LEVEL_LABELS[currentLevel]}{' '}
          <span className="font-bold text-[var(--accent-700)]">→ {SKILL_LEVEL_LABELS[targetLevel]}</span>
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--brand-50)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--brand-600)]"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${cur}%` }}
          transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${cur}%`,
            background:
              'repeating-linear-gradient(45deg, var(--accent-200), var(--accent-200) 5px, var(--accent-100) 5px, var(--accent-100) 10px)',
          }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${gap}%` }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
