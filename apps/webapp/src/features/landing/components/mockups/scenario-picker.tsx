import { Check } from 'lucide-react';
import { BrowserFrame } from '../browser-frame';

const CARDS = [
  { tag: 'TI', tagClass: 'text-blue-400 bg-blue-400/15', bar: 'w-[45%] bg-blue-400/60' },
  { tag: 'ECO', tagClass: 'text-emerald-400 bg-emerald-400/15', bar: 'w-[30%] bg-emerald-400/60' },
  { tag: 'FIN', tagClass: 'text-violet-400 bg-violet-400/15', bar: 'w-[58%] bg-violet-400/60' },
];

/** Step 1 illustration: a scenario catalogue with one card selected. */
export function ScenarioPickerMockup() {
  return (
    <BrowserFrame url="app.simex-pro.com/scenarios">
      <div className="grid h-full grid-cols-2 gap-3 p-4">
        <div className="relative flex flex-col gap-2 rounded-xl border-2 border-[var(--accent-500)] bg-white/5 p-3 shadow-[0_0_12px_rgba(238,122,58,0.2)]">
          <span className="self-start rounded bg-[var(--accent-500)]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-400)]">
            BTP
          </span>
          <div className="h-2 w-4/5 rounded bg-white/30" />
          <div className="h-2 w-3/5 rounded bg-white/20" />
          <div className="mt-auto h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-[var(--accent-500)]" />
          </div>
          <div className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-[var(--accent-500)]">
            <Check size={10} className="text-white" />
          </div>
        </div>
        {CARDS.map((card) => (
          <div key={card.tag} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <span className={`self-start rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${card.tagClass}`}>
              {card.tag}
            </span>
            <div className="h-2 w-4/5 rounded bg-white/20" />
            <div className="h-2 w-3/5 rounded bg-white/10" />
            <div className="mt-auto h-1 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${card.bar}`} />
            </div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}
