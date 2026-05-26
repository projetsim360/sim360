import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import type { ActiveSimulationSummary } from '../types/dashboard.types';

const TOTAL_PHASES = 5;

type PhaseTone = 'brand' | 'accent' | 'success';

function phaseTone(phase: number): PhaseTone {
  if (phase <= 1) return 'brand';
  if (phase <= 3) return 'accent';
  return 'success';
}

const BADGE_TONE: Record<PhaseTone, string> = {
  brand: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  accent: 'bg-[var(--accent-100)] text-[var(--accent-700)]',
  success: 'bg-[var(--success-50)] text-[var(--success-700)]',
};

const AVATAR_BG = ['#1A2B48', '#EE7A3A', '#3D5478', '#78716C'];

function TeamAvatars({ members }: { members: ActiveSimulationSummary['teamMembers'] }) {
  if (!members || members.length === 0) return null;
  const shown = members.slice(0, 4);
  const extra = members.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((m, i) => (
        <span
          key={`${m.initials}-${i}`}
          title={m.name}
          className="flex size-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
          style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}
        >
          {m.initials}
        </span>
      ))}
      {extra > 0 && (
        <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[var(--neutral-300)] text-[10px] font-bold text-white">
          +{extra}
        </span>
      )}
    </div>
  );
}

export function ActiveSimulationsCard({
  simulations,
  loading,
}: {
  simulations: ActiveSimulationSummary[];
  loading: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <Card className="shadow-[0_2px_4px_rgba(15,26,46,0.05),0_6px_16px_rgba(15,26,46,0.06)]">
      <CardContent className="p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
              Simulations
            </span>
            <h3 className="font-display text-[19px] font-bold text-[var(--brand-700)]">En cours</h3>
          </div>
          <Link to="/simulations" className="text-[13px] font-semibold text-[var(--accent-600)]">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 pt-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : simulations.length === 0 ? (
          <EmptyState
            icon="rocket"
            title="Aucune simulation en cours"
            description="Lancez votre première simulation pour commencer votre apprentissage."
            action={{ label: 'Démarrer une simulation', href: '/simulations/new' }}
          />
        ) : (
          <motion.div
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? undefined : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            {simulations.map((sim) => {
              const tone = phaseTone(sim.currentPhase);
              const progress = Math.round((sim.currentPhase / TOTAL_PHASES) * 100);
              return (
                <motion.div key={sim.id} variants={reduce ? undefined : staggerItem}>
                  <Link
                    to={`/simulations/${sim.id}`}
                    className="group grid grid-cols-[1fr_auto] items-center gap-4 border-t border-border py-3.5 first:border-t-0 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-display text-[15px] font-bold text-[var(--brand-700)]">
                          {sim.projectName}
                        </h4>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
                            BADGE_TONE[tone],
                          )}
                        >
                          Phase {sim.currentPhase}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-[var(--neutral-500)]">{sim.phaseName}</p>
                      <Progress value={progress} variant={tone} className="mt-2 h-1.5" />
                    </div>
                    <div className="flex items-center gap-3">
                      <TeamAvatars members={sim.teamMembers} />
                      <span className="hidden items-center gap-0.5 text-xs font-semibold text-[var(--accent-600)] opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                        Reprendre
                        <KeenIcon icon="right" style="duotone" className="text-[10px]" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
