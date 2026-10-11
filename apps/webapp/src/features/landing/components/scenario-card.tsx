import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Clock, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PublicMessageKey } from '@/i18n/public-messages';
import type { PublicScenario } from '../types/public-scenario';
import { usePublicSession } from '../providers/public-session';
import { useAppLink } from '../hooks/use-public-locale';

const LEVEL_TONE: Record<PublicScenario['difficulty'], string> = {
  BEGINNER: 'bg-emerald-500/15 text-emerald-400',
  INTERMEDIATE: 'bg-amber-500/15 text-amber-400',
  ADVANCED: 'bg-rose-500/15 text-rose-400',
};

export function ScenarioCard({ scenario }: { scenario: PublicScenario }) {
  const appLink = useAppLink();
  const { formatMessage } = useIntl();
  const { user } = usePublicSession();
  const sectorKey = `sector.${scenario.sector}` as PublicMessageKey;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-[var(--accent-500)]/60">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-[var(--accent-500)]/15 px-2.5 py-1 text-[var(--accent-300)]">{formatMessage({ id: sectorKey })}</span>
        <span className={cn('rounded-full px-2.5 py-1', LEVEL_TONE[scenario.difficulty])}>{formatMessage({ id: `level.${scenario.difficulty}` })}</span>
      </div>
      <h2 className="font-display text-xl font-bold text-foreground">{scenario.title}</h2>
      {scenario.description && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{scenario.description}</p>}
      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-foreground/70">
        <div className="inline-flex items-center gap-1.5">
          <Clock size={15} aria-hidden="true" />
          <dd>{formatMessage({ id: 'scenarios.duration' }, { hours: scenario.estimatedDurationHours })}</dd>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Layers size={15} aria-hidden="true" />
          <dd>{formatMessage({ id: 'scenarios.phases' }, { count: scenario.phaseCount })}</dd>
        </div>
      </dl>
      {scenario.competencies.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{formatMessage({ id: 'scenarios.competencies' })}</p>
          <ul className="flex flex-wrap gap-1.5">
            {scenario.competencies.slice(0, 5).map((c) => (
              <li key={c} className="rounded-md border border-border px-2 py-0.5 text-xs text-foreground/80">
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <span className="text-xs text-muted-foreground">{formatMessage({ id: `scenarios.plan.${scenario.requiredPlan}` })}</span>
        <Button asChild variant="outline" size="sm">
          <Link to={appLink(user ? `/simulations/new?scenario=${scenario.id}` : '/auth/sign-up')}>{formatMessage({ id: user ? 'scenarios.ctaLoggedIn' : 'scenarios.cta' })}</Link>
        </Button>
      </div>
    </article>
  );
}
