import { useIntl } from 'react-intl';
import { BrowserFrame } from '../browser-frame';

const ACTORS = [
  { initials: 'MS', name: 'Marc', role: 'Sponsor', color: 'bg-blue-500' },
  { initials: 'ND', name: 'Nina', role: 'Dev lead', color: 'bg-violet-500' },
  { initials: 'TC', name: 'Tom', role: 'PMO', color: 'bg-emerald-500' },
];

/** Step 2 illustration: actors, live indicators and three decision options. */
export function DecisionBoardMockup() {
  const { formatMessage } = useIntl();
  return (
    <BrowserFrame url="app.simex-pro.com/simulation/tour-4">
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="flex flex-1 gap-3">
          <div className="flex w-2/5 flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">{formatMessage({ id: 'mockup.actors' })}</p>
            {ACTORS.map((actor) => (
              <div key={actor.name} className="flex items-center gap-2">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white ${actor.color}`}>
                  {actor.initials}
                </span>
                <div>
                  <p className="text-[10px] font-medium leading-none text-white/80">{actor.name}</p>
                  <p className="mt-0.5 text-[9px] leading-none text-white/40">{actor.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">{formatMessage({ id: 'mockup.kpis' })}</p>
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
              <p className="mb-0.5 text-[9px] text-white/50">{formatMessage({ id: 'mockup.budgetUsed' })}</p>
              <p className="font-display text-base font-extrabold text-[var(--accent-500)]">65 %</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-white/5 p-2.5">
              <p className="mb-0.5 text-[9px] text-white/50">{formatMessage({ id: 'mockup.teamMorale' })}</p>
              <p className="font-display text-base font-extrabold text-red-400">{formatMessage({ id: 'mockup.moraleLow' })}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <p className="text-[9px] leading-snug text-white/50">{formatMessage({ id: 'mockup.option1' })}</p>
          </div>
          <div className="rounded-lg border-2 border-[var(--accent-500)] bg-white/5 p-2 text-center shadow-[0_0_8px_rgba(238,122,58,0.2)]">
            <p className="text-[9px] font-semibold leading-snug text-[var(--accent-300)]">{formatMessage({ id: 'mockup.option2' })}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <p className="text-[9px] leading-snug text-white/50">{formatMessage({ id: 'mockup.option3' })}</p>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}
