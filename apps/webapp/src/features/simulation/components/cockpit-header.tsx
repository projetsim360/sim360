import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { DisabledWithTooltip } from '@/components/ui/disabled-with-tooltip';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { Simulation } from '../types/simulation.types';

const STATUS_LABEL: Record<Simulation['status'], string> = {
  DRAFT: 'Brouillon',
  ONBOARDING: 'Passation',
  IN_PROGRESS: 'En cours',
  PAUSED: 'En pause',
  COMPLETED: 'Terminée',
  ABANDONED: 'Abandonnée',
};

const STATUS_TONE: Record<Simulation['status'], string> = {
  DRAFT: 'bg-[var(--neutral-100)] text-[var(--neutral-600)]',
  ONBOARDING: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  IN_PROGRESS: 'bg-[#D1FAE5] text-[var(--success-700)]',
  PAUSED: 'bg-[var(--warning-50)] text-[var(--warning-700)]',
  COMPLETED: 'bg-[var(--brand-100)] text-[var(--brand-700)]',
  ABANDONED: 'bg-[var(--error-50)] text-[var(--error-700)]',
};

const STATUS_DOT: Record<Simulation['status'], string> = {
  DRAFT: 'bg-[var(--neutral-400)]',
  ONBOARDING: 'bg-[var(--brand-500)]',
  IN_PROGRESS: 'bg-[var(--success-500)]',
  PAUSED: 'bg-[var(--warning-500)]',
  COMPLETED: 'bg-[var(--brand-500)]',
  ABANDONED: 'bg-[var(--error-500)]',
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'non démarré';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "démarré aujourd'hui";
  if (days === 1) return 'démarré hier';
  if (days < 7) return `démarré il y a ${days} jours`;
  if (days < 30) return `démarré il y a ${Math.floor(days / 7)} sem.`;
  return `démarré le ${new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
}

interface CockpitHeaderProps {
  sim: Simulation;
  pendingDecisions: number;
  actionLoading: boolean;
  onPauseResume: () => void;
  onAdvancePhase: () => void;
}

export function CockpitHeader({
  sim,
  pendingDecisions,
  actionLoading,
  onPauseResume,
  onAdvancePhase,
}: CockpitHeaderProps) {
  const activePhase = sim.phases?.find((p) => p.status === 'ACTIVE');
  const totalPhases = sim.phases?.length ?? 0;
  const isRunning = sim.status === 'IN_PROGRESS';
  const isPaused = sim.status === 'PAUSED';
  const isFinished = sim.status === 'COMPLETED' || sim.status === 'ABANDONED';
  const lastPhase = activePhase?.order === totalPhases;
  const canAdvance = isRunning && !!activePhase && !lastPhase && pendingDecisions === 0;
  const advanceReason = !activePhase
    ? 'Aucune phase active.'
    : lastPhase
      ? 'Vous êtes dans la dernière phase.'
      : pendingDecisions > 0
        ? `${pendingDecisions} décision${pendingDecisions > 1 ? 's' : ''} à trancher avant d'avancer.`
        : !isRunning
          ? 'Reprenez la simulation pour avancer.'
          : '';

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-semibold uppercase tracking-[1px] text-[var(--neutral-400)]">
          Simulation
        </span>
        <h2 className="mt-1 font-display text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[30px]">
          {sim.project?.name ?? 'Projet'}
        </h2>
        <p className="mt-1 truncate text-[13px] text-muted-foreground">
          {sim.scenario?.title ?? ''}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
              STATUS_TONE[sim.status],
            )}
          >
            <span className={cn('size-1.5 rounded-full', STATUS_DOT[sim.status])} />
            {STATUS_LABEL[sim.status]}
          </span>
          {activePhase && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-100)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--accent-700)]">
              <span className="size-1.5 rounded-full bg-[var(--accent-500)]" />
              Phase {activePhase.order} sur {totalPhases} · {activePhase.name}
            </span>
          )}
          {pendingDecisions > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--warning-50)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--warning-700)]">
              <span className="size-1.5 rounded-full bg-[var(--warning-500)]" />
              {pendingDecisions} décision{pendingDecisions > 1 ? 's' : ''} à trancher
            </span>
          )}
          <span className="text-xs text-[var(--neutral-400)]">{timeAgo(sim.startedAt)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isFinished ? (
          <Button variant="primary" size="sm" asChild>
            <Link to={`/valorisation/${sim.id}/debriefing`}>
              Voir le débriefing
              <KeenIcon icon="right" style="duotone" className="ms-1 text-xs" />
            </Link>
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseResume}
              disabled={actionLoading || (!isRunning && !isPaused)}
            >
              {isPaused ? (
                <>
                  <KeenIcon icon="play" style="duotone" className="text-xs" /> Reprendre
                </>
              ) : (
                <>
                  <KeenIcon icon="pause" style="duotone" className="text-xs" /> Mettre en pause
                </>
              )}
            </Button>
            <DisabledWithTooltip disabled={!canAdvance} reason={advanceReason}>
              <Button
                variant="primary"
                size="sm"
                onClick={onAdvancePhase}
                disabled={!canAdvance || actionLoading}
              >
                Phase suivante
                <KeenIcon icon="right" style="duotone" className="ms-1 text-xs" />
              </Button>
            </DisabledWithTooltip>
          </>
        )}
      </div>
    </div>
  );
}
