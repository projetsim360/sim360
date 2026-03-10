import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeenIcon } from '@/components/keenicons';
import { cn } from '@/lib/utils';
import type { GettingStarted } from '../types/dashboard.types';

interface GettingStartedCardProps {
  data: GettingStarted;
}

interface StepItem {
  key: keyof Omit<GettingStarted, 'completionPercent'>;
  label: string;
  description: string;
  icon: string;
  link?: string;
}

const STEPS: StepItem[] = [
  { key: 'profileCompleted', label: 'Profil', description: 'Completez votre profil', icon: 'profile-circle', link: '/onboarding' },
  { key: 'firstSimulationLaunched', label: 'Simulation', description: 'Lancez votre premiere simulation', icon: 'rocket', link: '/simulations/new' },
  { key: 'firstDeliverableSubmitted', label: 'Livrable', description: 'Soumettez un livrable', icon: 'document' },
  { key: 'firstDebriefingViewed', label: 'Debriefing', description: 'Consultez votre debriefing', icon: 'teacher' },
  { key: 'firstPortfolioShared', label: 'Portfolio', description: 'Partagez votre portfolio', icon: 'share', link: '/profile/badges' },
];

function CircularProgress({ value, size = 52 }: { value: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border dark:text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[#4b2f95] dark:text-brand-400 transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#4b2f95] dark:text-brand-400">
        {value}%
      </span>
    </div>
  );
}

export function GettingStartedCard({ data }: GettingStartedCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const allComplete = data.completionPercent === 100;
  const completedCount = STEPS.filter((s) => data[s.key]).length;

  if (dismissed) return null;

  if (allComplete) {
    return (
      <Card className="overflow-hidden shadow-none">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-brand-50 dark:bg-brand-800/30">
              <KeenIcon icon="check-circle" style="duotone" className="text-xl text-[#4b2f95] dark:text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Bravo ! Vous avez tout explore</p>
              <p className="text-xs text-muted-foreground">Vous maitrisez les bases de la plateforme</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            Masquer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-none">
      <CardContent className="py-5 px-5 lg:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center size-11 rounded-xl bg-brand-50 dark:bg-brand-800/30">
              <KeenIcon icon="rocket" style="duotone" className="text-xl text-[#4b2f95] dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Premiers pas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {completedCount}/{STEPS.length} etapes completees
              </p>
            </div>
          </div>
          <CircularProgress value={data.completionPercent} />
        </div>

        {/* Steps — horizontal on lg, vertical on mobile */}
        <div className="hidden lg:flex items-start gap-0">
          {STEPS.map((step, index) => {
            const completed = data[step.key];
            const isLast = index === STEPS.length - 1;
            const isNext = !completed && (index === 0 || data[STEPS[index - 1].key]);

            return (
              <div key={step.key} className="flex items-start flex-1">
                <StepNode
                  step={step}
                  completed={completed}
                  isNext={isNext}
                />
                {!isLast && (
                  <div className="flex-1 mt-4 mx-1">
                    <div
                      className={cn(
                        'h-0.5 w-full rounded-full transition-colors',
                        completed ? 'bg-[#4b2f95]/30 dark:bg-brand-400/40' : 'bg-border dark:bg-white/10',
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical list */}
        <div className="lg:hidden space-y-1.5">
          {STEPS.map((step, index) => {
            const completed = data[step.key];
            const isNext = !completed && (index === 0 || data[STEPS[index - 1].key]);

            const content = (
              <div
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-xl transition-all',
                  '',
                  isNext
                    ? 'bg-brand-50/60 dark:bg-brand-800/20'
                    : 'hover:bg-muted/50 dark:hover:bg-white/5',
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center size-8 rounded-lg shrink-0 transition-colors',
                    completed
                      ? 'bg-brand-500 dark:bg-brand-400'
                      : isNext
                        ? 'bg-brand-50 dark:bg-brand-800/20'
                        : 'bg-muted dark:bg-white/5',
                  )}
                >
                  {completed ? (
                    <KeenIcon icon="check" style="duotone" className="text-sm text-white dark:text-brand-900" />
                  ) : (
                    <KeenIcon icon={step.icon} style="duotone" className={cn('text-sm', isNext ? 'text-[#4b2f95] dark:text-brand-400' : 'text-muted-foreground')} />
                  )}
                </div>
                <span
                  className={cn(
                    'text-sm flex-1',
                    completed ? 'line-through text-muted-foreground' : isNext ? 'text-foreground font-medium' : 'text-muted-foreground',
                  )}
                >
                  {step.description}
                </span>
                {step.link && !completed && (
                  <KeenIcon icon="right" style="duotone" className="text-xs text-muted-foreground" />
                )}
              </div>
            );

            if (step.link && !completed) {
              return (
                <Link key={step.key} to={step.link} className="block">
                  {content}
                </Link>
              );
            }

            return <div key={step.key}>{content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function StepNode({
  step,
  completed,
  isNext,
}: {
  step: StepItem;
  completed: boolean;
  isNext: boolean;
}) {
  const node = (
    <div
      className={cn(
        'flex flex-col items-center gap-2 w-full transition-all',
        '',
        isNext ? 'scale-105' : '',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center size-8 rounded-xl transition-all',
          completed
            ? 'bg-brand-500 dark:bg-brand-400'
            : isNext
              ? 'bg-brand-50 dark:bg-brand-800/20 ring-1 ring-[#4b2f95]/20 dark:ring-brand-400/30'
              : 'bg-muted dark:bg-white/5',
        )}
      >
        {completed ? (
          <KeenIcon icon="check" style="duotone" className="text-sm text-white dark:text-brand-900" />
        ) : (
          <KeenIcon
            icon={step.icon}
            style="duotone"
            className={cn('text-sm', isNext ? 'text-[#4b2f95] dark:text-brand-400' : 'text-muted-foreground/60')}
          />
        )}
      </div>
      <span
        className={cn(
          'text-[11px] text-center leading-tight',
          completed
            ? 'text-muted-foreground line-through'
            : isNext
              ? 'text-foreground font-semibold'
              : 'text-muted-foreground',
        )}
      >
        {step.label}
      </span>
    </div>
  );

  if (step.link && !completed) {
    return (
      <Link to={step.link} className="flex-shrink-0 w-16 cursor-pointer group">
        {node}
      </Link>
    );
  }

  return <div className="flex-shrink-0 w-16">{node}</div>;
}
