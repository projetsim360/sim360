import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { KeenIcon } from '@/components/keenicons';
import type { NextStep } from '../types/dashboard.types';

interface DashboardHeroProps {
  firstName: string;
  isNewUser: boolean;
  activeCount: number;
  averageScore: number | null;
  nextStep: NextStep | null;
}

export function DashboardHero({ firstName, isNewUser, activeCount, averageScore, nextStep }: DashboardHeroProps) {
  const reduce = useReducedMotion();
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
              Bienvenue sur Simex
            </span>
            <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-tight">
              Lancez votre première simulation
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-100)]">
              Suivez les étapes ci-dessous pour démarrer votre parcours.
            </p>
          </div>
          <Link
            to="/simulations/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--accent-500)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)]"
          >
            Démarrer
            <KeenIcon icon="right" style="duotone" className="text-xs" />
          </Link>
        </>
      ) : (
        <>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
              Tableau de bord
            </span>
            <h2 className="mt-1 font-display text-[24px] font-extrabold tracking-tight">
              Bonjour {firstName} 👋
            </h2>
            <p className="mt-1 text-sm text-[var(--brand-100)]">
              {activeCount} simulation{activeCount > 1 ? 's' : ''} en cours
              {averageScore != null ? ` · score moyen ${averageScore}/100` : ''}.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-4 py-3">
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--brand-200)]">
                {isAllClear ? 'Statut' : 'Prochaine action'}
              </span>
              <p className="mt-0.5 truncate text-sm font-bold text-white">
                {isAllClear ? 'Tout est à jour' : nextStep!.simulationName || 'Action à traiter'}
              </p>
            </div>
            {!isAllClear && (
              <Link
                to={nextStep!.link}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--accent-500)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-600)]"
              >
                Continuer
                <KeenIcon icon="right" style="duotone" className="text-xs" />
              </Link>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
