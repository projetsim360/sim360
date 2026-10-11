import { motion, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { BrowserFrame } from '../browser-frame';

const CARDS = [
  { tag: 'TI', tagClass: 'text-blue-400 bg-blue-400/15', bar: 'w-[45%] bg-blue-400/60' },
  { tag: 'ECO', tagClass: 'text-emerald-400 bg-emerald-400/15', bar: 'w-[30%] bg-emerald-400/60' },
  { tag: 'FIN', tagClass: 'text-violet-400 bg-violet-400/15', bar: 'w-[58%] bg-violet-400/60' },
];

const grid: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const card: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };
const tick: Variants = { hidden: { scale: 0 }, show: { scale: 1, transition: { delay: 0.5, type: 'spring', stiffness: 400, damping: 22 } } };

/** Step 1 illustration: a scenario catalogue whose cards appear one by one, then one gets picked. */
export function ScenarioPickerMockup() {
  return (
    <BrowserFrame url="app.simex-pro.com/scenarios">
      <motion.div className="grid h-full grid-cols-2 gap-3 p-4" variants={grid} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
        <motion.div variants={card} className="relative flex flex-col gap-2 rounded-xl border-2 border-[var(--accent-500)] bg-white/5 p-3 shadow-[0_0_12px_rgba(238,122,58,0.2)]">
          <span className="self-start rounded bg-[var(--accent-500)]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-400)]">
            BTP
          </span>
          <div className="h-2 w-4/5 rounded bg-white/30" />
          <div className="h-2 w-3/5 rounded bg-white/20" />
          <div className="mt-auto h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-[var(--accent-500)]" />
          </div>
          <motion.div variants={tick} className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-[var(--accent-500)]">
            <Check size={10} className="text-white" />
          </motion.div>
        </motion.div>
        {CARDS.map((c) => (
          <motion.div key={c.tag} variants={card} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <span className={`self-start rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${c.tagClass}`}>{c.tag}</span>
            <div className="h-2 w-4/5 rounded bg-white/20" />
            <div className="h-2 w-3/5 rounded bg-white/10" />
            <div className="mt-auto h-1 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${c.bar}`} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </BrowserFrame>
  );
}
