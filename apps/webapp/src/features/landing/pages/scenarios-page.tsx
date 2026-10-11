import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { PublicMessageKey } from '@/i18n/public-messages';
import { PublicPage } from '../components/public-page';
import { ScenarioCard } from '../components/scenario-card';
import type { PublicScenario } from '../types/public-scenario';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
type Level = (typeof LEVELS)[number] | 'ALL';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; scenarios: PublicScenario[] };

/**
 * Public catalogue. The public entry has no query client on purpose (bundle size), so this
 * page fetches once on mount; the API caches the list for five minutes.
 */
export default function ScenariosPage() {
  const { formatMessage } = useIntl();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [sector, setSector] = useState<string>('ALL');
  const [level, setLevel] = useState<Level>('ALL');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    api
      .get<PublicScenario[]>('/public/scenarios')
      .then((scenarios) => !cancelled && setState({ status: 'ready', scenarios }))
      .catch(() => !cancelled && setState({ status: 'error' }));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const all = useMemo(() => (state.status === 'ready' ? state.scenarios : []), [state]);
  const sectors = useMemo(() => [...new Set(all.map((s) => s.sector))].sort((a, b) => a.localeCompare(b)), [all]);
  const visible = all.filter((s) => (sector === 'ALL' || s.sector === sector) && (level === 'ALL' || s.difficulty === level));

  return (
    <PublicPage id="scenarios" width="wide">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={formatMessage({ id: 'scenarios.filter.level' })}>
          {(['ALL', ...LEVELS] as Level[]).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                level === l ? 'border-[var(--accent-500)] bg-[var(--accent-500)]/15 text-[var(--accent-300)]' : 'border-border text-foreground/70 hover:text-foreground',
              )}
            >
              {formatMessage({ id: l === 'ALL' ? 'scenarios.filter.all' : `level.${l}` })}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm text-foreground/80">
          {formatMessage({ id: 'scenarios.filter.sector' })}
          {/* Native select: accessible, keyboard friendly, and keeps the public bundle small. */}
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            <option value="ALL">{formatMessage({ id: 'scenarios.filter.all' })}</option>
            {sectors.map((code) => (
              <option key={code} value={code}>
                {formatMessage({ id: `sector.${code}` as PublicMessageKey })}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.status === 'loading' && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-card/60" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">{formatMessage({ id: 'scenarios.error' })}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setAttempt((n) => n + 1)}>
            {formatMessage({ id: 'common.retry' })}
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">{formatMessage({ id: 'scenarios.count' }, { count: visible.length })}</p>
          {visible.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">{formatMessage({ id: 'scenarios.empty' })}</p>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((s) => (
                <li key={s.id}>
                  <ScenarioCard scenario={s} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PublicPage>
  );
}
