import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { KeenIcon } from '@/components/keenicons';
import type { NextStep } from '../types/dashboard.types';
import { useT } from '@/i18n/app/use-t';

interface DashboardHeroProps {
  firstName: string;
  isNewUser: boolean;
  activeCount: number;
  averageScore: number | null;
  nextStep: NextStep | null;
}

export function DashboardHero({ firstName, isNewUser, activeCount, averageScore, nextStep }: DashboardHeroProps) {
  const reduce = useReducedMotion();
  const t = useT();
  const isAllClear = !nextStep || nextStep.type === 'all_clear';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-5 rounded-xl p-6 text-white md:flex-row md:items-center md:justify-between"
      style={{ background: 'linear-gradient(120deg, var(--brand-700), var(--brand-600))' }}
    >
      {isNewUser ? (
        <>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
              {t('dashboard.hero.welcome')}
            </span>
            <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-tight">
              {t('dashboard.hero.firstTitle')}
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-100)]">
              {t('dashboard.hero.firstText')}
            </p>
          </div>
          <Link
            to="/simulations/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--accent-500)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)]"
          >
            {t('dashboard.hero.start')}
            <KeenIcon icon="right" style="duotone" className="text-xs" />
          </Link>
        </>
      ) : (
        <>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
              {t('menu.dashboard')}
            </span>
            <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-tight">
              {t('dashboard.hero.hello', { name: firstName })}
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-100)]">
              {averageScore != null
                ? t('dashboard.hero.summaryScore', { count: activeCount, score: averageScore })
                : t('dashboard.hero.summary', { count: activeCount })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-4 py-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
                {isAllClear ? t('dashboard.hero.status') : t('dashboard.hero.nextAction')}
              </span>
              <p className="mt-0.5 truncate text-sm font-bold text-white">
                {isAllClear ? t('dashboard.allClear') : nextStep!.simulationName || t('dashboard.hero.actionPending')}
              </p>
            </div>
            {!isAllClear && (
              <Link
                to={nextStep!.link}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent-500)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)]"
              >
                {t('common.continue')}
                <KeenIcon icon="right" style="duotone" className="text-xs" />
              </Link>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
