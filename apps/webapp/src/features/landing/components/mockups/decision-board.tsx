import { useIntl } from 'react-intl';
import { motion, type Variants } from 'framer-motion';
import { BrowserFrame } from '../browser-frame';

const ACTORS = [
  { initials: 'MS', name: 'Marc', role: 'Sponsor', color: 'bg-blue-500' },
  { initials: 'ND', name: 'Nina', role: 'Dev lead', color: 'bg-violet-500' },
  { initials: 'TC', name: 'Tom', role: 'PMO', color: 'bg-emerald-500' },
];

const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const item: Variants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const choice: Variants = {
  hidden: { opacity: 0.6, scale: 1 },
  show: { opacity: 1, scale: [1, 1.02, 1], transition: { delay: 0.9, duration: 0.5 } },
};

/** Step 2 illustration: actors and indicators appear, then the chosen option pulses. */
export function DecisionBoardMockup() {
  const { formatMessage } = useIntl();
  return (
    <BrowserFrame url="app.simex-pro.com/simulation/tour-4">
      <motion.div className="flex h-full flex-col gap-3 p-4" variants={list} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
        <div className="flex flex-1 gap-3">
          <motion.div variants={list} className="flex w-2/5 flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">{formatMessage({ id: 'mockup.actors' })}</p>
            {ACTORS.map((actor) => (
              <motion.div key={actor.name} variants={item} className="flex items-center gap-2">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white ${actor.color}`}>
                  {actor.initials}
                </span>
                <div>
                  <p className="text-[10px] font-medium leading-none text-white/80">{actor.name}</p>
                  <p className="mt-0.5 text-[9px] leading-none text-white/40">{actor.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={list} className="flex flex-1 flex-col gap-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">{formatMessage({ id: 'mockup.kpis' })}</p>
            <motion.div variants={item} className="rounded-lg border border-white/10 bg-white/5 p-2.5">
              <p className="mb-0.5 text-[9px] text-white/50">{formatMessage({ id: 'mockup.budgetUsed' })}</p>
              <p className="font-display text-base font-extrabold text-[var(--accent-500)]">65 %</p>
            </motion.div>
            <motion.div variants={item} className="rounded-lg border border-red-500/30 bg-white/5 p-2.5">
              <p className="mb-0.5 text-[9px] text-white/50">{formatMessage({ id: 'mockup.teamMorale' })}</p>
              <p className="font-display text-base font-extrabold text-red-400">{formatMessage({ id: 'mockup.moraleLow' })}</p>
            </motion.div>
          </motion.div>
        </div>
        <motion.div variants={list} className="grid grid-cols-3 gap-2">
          <motion.div variants={item} className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <p className="text-[9px] leading-snug text-white/50">{formatMessage({ id: 'mockup.option1' })}</p>
          </motion.div>
          <motion.div variants={choice} className="rounded-lg border-2 border-[var(--accent-500)] bg-white/5 p-2 text-center shadow-[0_0_8px_rgba(238,122,58,0.2)]">
            <p className="text-[9px] font-semibold leading-snug text-[var(--accent-300)]">{formatMessage({ id: 'mockup.option2' })}</p>
          </motion.div>
          <motion.div variants={item} className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
            <p className="text-[9px] leading-snug text-white/50">{formatMessage({ id: 'mockup.option3' })}</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </BrowserFrame>
  );
}
