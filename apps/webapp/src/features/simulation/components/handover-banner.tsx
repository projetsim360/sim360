import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/motion';
import { useAuth } from '@/providers/auth-provider';
import { simulationApi } from '../api/simulation.api';
import type { HandoverStatus, Simulation, SimulationMeeting } from '../types/simulation.types';
import type { AppMessageKey } from '@/i18n/app/messages';
import { useT } from '@/i18n/app/use-t';

interface HandoverBannerProps {
  simulationId: string;
  sim?: Pick<Simulation, 'project'>;
  onHandoverComplete?: () => void;
}

type StepKey = 'HR' | 'PMO' | 'DONE';
type StepState = 'done' | 'active' | 'future';

const STEP_DEFS: { key: StepKey; label: AppMessageKey; icon: string }[] = [
  { key: 'HR', label: 'handover.step.hr', icon: 'people' },
  { key: 'PMO', label: 'handover.step.pmo', icon: 'notepad' },
  { key: 'DONE', label: 'handover.step.start', icon: 'rocket' },
];

const STEP_DURATIONS_MIN: Record<StepKey, number> = { HR: 10, PMO: 15, DONE: 2 };

function StepCircle({
  state,
  icon,
  size,
  showRevisitBadge = false,
}: {
  state: StepState;
  icon: string;
  size: 'sm' | 'md' | 'lg';
  showRevisitBadge?: boolean;
}) {
  const sizeClass =
    size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (state === 'done') {
    return (
      <div className={cn('relative rounded-full bg-white text-[var(--success-500)] flex items-center justify-center', sizeClass)}>
        <KeenIcon icon="check" style="solid" className="text-base leading-none" />
        {showRevisitBadge && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--success-500)] text-white flex items-center justify-center"
          >
            <KeenIcon icon="arrows-circle" style="solid" className="text-[8px] leading-none" />
          </span>
        )}
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className={cn('rounded-full bg-[var(--accent-500)] text-white flex items-center justify-center animate-handover-pulse-ring', sizeClass)}>
        <KeenIcon icon={icon} style="duotone" className="text-base leading-none" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-full bg-white/8 border border-dashed border-white/30 text-white/55 flex items-center justify-center', sizeClass)}>
      <KeenIcon icon={icon} style="duotone" className="text-base leading-none" />
    </div>
  );
}

function StepMeta({ state, durationMin }: { state: StepState; durationMin: number }) {
  const t = useT();
  if (state === 'done') return <span className="text-[10px] text-white/60">{t('handover.meta.done')}</span>;
  if (state === 'active') return <span className="text-[10px] text-white/80">{t('handover.meta.active', { min: durationMin })}</span>;
  return <span className="text-[10px] text-white/40">{t('handover.meta.future', { min: durationMin })}</span>;
}

function DesktopStep({
  step,
  state,
  meeting,
}: {
  step: (typeof STEP_DEFS)[number];
  state: StepState;
  meeting: SimulationMeeting | null;
}) {
  const t = useT();
  const labelClass = state === 'future' ? 'text-white/55' : 'text-white';
  const inner = (
    <div className="flex flex-col items-center w-28" aria-current={state === 'active' ? 'step' : undefined}>
      <StepCircle
        state={state}
        icon={step.icon}
        size={state === 'active' ? 'lg' : 'md'}
        showRevisitBadge={state === 'done' && meeting !== null}
      />
      <p className={cn('mt-2 text-[11px] font-bold', labelClass)}>{t(step.label)}</p>
      <StepMeta state={state} durationMin={STEP_DURATIONS_MIN[step.key]} />
    </div>
  );
  if (state === 'done' && meeting !== null) {
    return (
      <Link
        to={`/meetings/${meeting.id}`}
        className="rounded-md focus-visible:outline-2 focus-visible:outline-white/70"
        aria-label={t('handover.revisit', { step: t(step.label) })}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

function MobileStep({
  step,
  state,
  meeting,
  isLast,
}: {
  step: (typeof STEP_DEFS)[number];
  state: StepState;
  meeting: SimulationMeeting | null;
  isLast: boolean;
}) {
  const t = useT();
  const labelClass = state === 'future' ? 'text-white/55' : 'text-white';
  const inner = (
    <div className="flex items-start gap-3" aria-current={state === 'active' ? 'step' : undefined}>
      <div className="flex flex-col items-center flex-shrink-0">
        <StepCircle
          state={state}
          icon={step.icon}
          size={state === 'active' ? 'md' : 'sm'}
        />
        {!isLast && (
          <div className={cn('w-[2px] flex-1 min-h-6 mt-1 rounded-full', state === 'done' ? 'bg-white/85' : 'bg-white/20')} />
        )}
      </div>
      <div className={cn('flex-1 min-w-0', isLast ? '' : 'pb-3')}>
        <p className={cn('text-[11px] font-bold', labelClass)}>{t(step.label)}</p>
        <StepMeta state={state} durationMin={STEP_DURATIONS_MIN[step.key]} />
      </div>
    </div>
  );
  if (state === 'done' && meeting !== null) {
    return (
      <Link
        to={`/meetings/${meeting.id}`}
        className="block rounded-md focus-visible:outline-2 focus-visible:outline-white/70"
        aria-label={t('handover.revisit', { step: t(step.label) })}
      >
        {inner}
      </Link>
    );
  }
  return inner;
}

export function HandoverBanner({ simulationId, sim, onHandoverComplete }: HandoverBannerProps) {
  const t = useT();
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const gridId = useId();
  const [status, setStatus] = useState<HandoverStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    simulationApi
      .getHandoverStatus(simulationId)
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [simulationId]);

  if (loading) return <Skeleton className="h-72 sm:h-56 w-full rounded-xl mb-5" />;
  if (!status || !status.hasHandover) return null;

  const currentStepIndex = status.isComplete
    ? STEP_DEFS.length - 1
    : STEP_DEFS.findIndex((s) => s.key === status.currentStep);
  const stepIndexDisplay = Math.max(0, currentStepIndex) + 1;
  const remainingMin = STEP_DEFS.slice(currentStepIndex).reduce(
    (acc, s) => acc + STEP_DURATIONS_MIN[s.key],
    0,
  );

  const firstName = user?.firstName ?? t('handover.learner');
  const companyName = sim?.project?.client ?? sim?.project?.name ?? t('handover.yourProject');

  const stateOf = (index: number): StepState => {
    if (status.isComplete) return 'done';
    if (index < currentStepIndex) return 'done';
    if (index === currentStepIndex) return 'active';
    return 'future';
  };

  const meetingFor = (key: StepKey): SimulationMeeting | null => {
    if (key === 'HR') return status.hrMeeting;
    if (key === 'PMO') return status.pmoMeeting;
    return null;
  };

  async function handleCompleteHandover() {
    setCompleting(true);
    try {
      await simulationApi.completeHandover(simulationId);
      onHandoverComplete?.();
    } catch {
      // swallow — the parent will surface errors via its own toast flow if needed
    } finally {
      setCompleting(false);
    }
  }

  const ctaClass =
    'bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white shadow-[0_8px_20px_rgba(238,122,58,0.40)] gap-2 w-full sm:w-auto';

  let cta: React.ReactNode = null;
  if (status.currentStep === 'HR' && status.hrMeeting) {
    cta = (
      <Button variant="primary" size="lg" asChild className={ctaClass}>
        <Link to={`/meetings/${status.hrMeeting.id}`} className="inline-flex items-center gap-2">
          <KeenIcon icon="people" style="duotone" className="text-sm leading-none" />
          {t('handover.cta.hr')}
        </Link>
      </Button>
    );
  } else if (status.currentStep === 'PMO' && status.pmoMeeting) {
    cta = (
      <Button variant="primary" size="lg" asChild className={ctaClass}>
        <Link to={`/meetings/${status.pmoMeeting.id}`} className="inline-flex items-center gap-2">
          <KeenIcon icon="notepad" style="duotone" className="text-sm leading-none" />
          {t('handover.cta.pmo')}
        </Link>
      </Button>
    );
  } else {
    cta = (
      <Button
        variant="primary"
        size="lg"
        onClick={handleCompleteHandover}
        disabled={completing}
        className={ctaClass}
      >
        <KeenIcon icon="rocket" style="duotone" className="text-sm leading-none" />
        {completing ? t('handover.cta.starting') : t('handover.cta.start')}
      </Button>
    );
  }

  return (
    <motion.section
      aria-labelledby="handover-title"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mb-5"
    >
      <style>{`
        @keyframes handover-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 5px rgba(238,122,58,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(238,122,58,0.20); }
        }
        .animate-handover-pulse-ring { animation: handover-pulse-ring 2s ease-in-out infinite; }

        @keyframes handover-beam-h {
          0%   { left: -30px;  opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: calc(100% + 30px); opacity: 0; }
        }
        @keyframes handover-beam-v {
          0%   { top: -30px;  opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% + 30px); opacity: 0; }
        }
      `}</style>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[var(--brand-900)] via-[var(--brand-800)] to-[var(--brand-700)] ring-1 ring-black/5 shadow-lg shadow-black/10 dark:ring-white/10 dark:shadow-black/50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(238,122,58,0.42), transparent 70%)' }}
        />
        {/* Square dotted grid via SVG pattern (truly square cells, independent of container ratio) */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M 32 0 L 0 0 0 32"
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1"
                strokeDasharray="1 3"
                strokeLinecap="round"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridId})`} />
        </svg>

        {/* Animated beams — gated by reduced-motion */}
        {!reduce && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[2px] w-6 rounded-full bg-[var(--accent-500)] shadow-[0_0_8px_rgba(238,122,58,0.8)]"
              style={{ top: '32px', left: 0, animation: 'handover-beam-h 5s linear 0.5s infinite' }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-[2px] w-6 rounded-full bg-[var(--accent-300)] shadow-[0_0_8px_rgba(245,165,112,0.8)]"
              style={{ top: '96px', left: 0, animation: 'handover-beam-h 6s linear 2.5s infinite' }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute w-[2px] h-6 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              style={{ left: '96px', top: 0, animation: 'handover-beam-v 7s linear 1.5s infinite' }}
            />
          </>
        )}
        <div className="relative z-10 p-5 sm:p-6 text-white">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5">
            <div>
              <h2 id="handover-title" className="font-display font-bold text-[17px] leading-tight">
                {status.isComplete ? t('handover.title.done', { name: firstName }) : t('handover.title.welcome', { name: firstName })}
              </h2>
              <p className="text-xs text-white/70 mt-1">
                {status.isComplete
                  ? t('handover.text.done')
                  : t('handover.text.welcome', { company: companyName })}
              </p>
            </div>
            <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={STEP_DEFS.length}
                aria-valuenow={stepIndexDisplay}
                aria-label={t('handover.progress')}
                className="bg-white/12 border border-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-semibold text-white"
              >
                {status.isComplete ? t('handover.ready') : t('handover.stepOf', { n: stepIndexDisplay, total: STEP_DEFS.length })}
              </div>
              {!status.isComplete && (
                <span className="text-[10px] text-white/55 hidden sm:inline">{t('handover.remaining', { min: remainingMin })}</span>
              )}
            </div>
          </div>

          {/* Desktop stepper */}
          <motion.ol
            role="list"
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="hidden sm:flex items-start justify-center gap-0"
          >
            {STEP_DEFS.map((step, i) => {
              const state = stateOf(i);
              const meeting = meetingFor(step.key);
              const isLast = i === STEP_DEFS.length - 1;
              return (
                <motion.li
                  key={step.key}
                  variants={reduce ? undefined : staggerItem}
                  className="flex items-start"
                >
                  <DesktopStep step={step} state={state} meeting={meeting} />
                  {!isLast && (
                    <div className="flex items-center h-10 mx-1">
                      <div
                        className={cn(
                          'w-14 h-[2px] rounded-full',
                          state === 'done' ? 'bg-white/85' : 'bg-white/20',
                        )}
                      />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>

          {/* Mobile stepper (vertical timeline) */}
          <motion.ol
            role="list"
            variants={reduce ? undefined : staggerContainer}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? undefined : 'show'}
            className="flex sm:hidden flex-col"
          >
            {STEP_DEFS.map((step, i) => {
              const state = stateOf(i);
              const meeting = meetingFor(step.key);
              const isLast = i === STEP_DEFS.length - 1;
              return (
                <motion.li key={step.key} variants={reduce ? undefined : staggerItem}>
                  <MobileStep step={step} state={state} meeting={meeting} isLast={isLast} />
                </motion.li>
              );
            })}
          </motion.ol>

          {/* CTA */}
          <div className="mt-5 flex justify-center">{cta}</div>
        </div>
      </div>
    </motion.section>
  );
}
