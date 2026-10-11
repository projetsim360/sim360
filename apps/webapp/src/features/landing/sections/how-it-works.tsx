import { useRef, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '../components/reveal';
import { ScenarioPickerMockup } from '../components/mockups/scenario-picker';
import { DecisionBoardMockup } from '../components/mockups/decision-board';
import { ReportRadarMockup } from '../components/mockups/report-radar';
import { useScrollContainer } from '../hooks/use-scroll-container';

type StepId = 'step1' | 'step2' | 'step3';

interface StepProps {
  number: string;
  id: StepId;
  mockup: ReactNode;
  /** Mockup on the right on desktop (text first). Mobile always shows the mockup first. */
  mockupRight: boolean;
}

function Step({ number, id, mockup, mockupRight }: StepProps) {
  const { formatMessage } = useIntl();
  const points = [1, 2, 3] as const;
  return (
    <Reveal className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div className={cn('space-y-5', mockupRight ? 'order-2 lg:order-1' : 'order-2')}>
        <motion.span
          className="block font-display text-[80px] font-extrabold leading-none tracking-tighter text-transparent"
          style={{ WebkitTextStroke: '1px var(--accent-500)' }}
          initial={{ opacity: 0.35 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-30% 0px -30% 0px' }}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        >
          {number}
        </motion.span>
        <h3 className="font-display text-3xl font-bold text-white lg:text-4xl">{formatMessage({ id: `how.${id}.title` })}</h3>
        <p className="text-lg leading-relaxed text-white/70">{formatMessage({ id: `how.${id}.text` })}</p>
        <ul className="space-y-2.5 text-[15px] text-white/85">
          {points.map((n, i) => (
            <motion.li
              key={n}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
            >
              <Check size={18} className="mt-0.5 shrink-0 text-[var(--accent-400)]" aria-hidden="true" />
              {formatMessage({ id: `how.${id}.point.${n}` })}
            </motion.li>
          ))}
        </ul>
      </div>
      <div className={cn(mockupRight ? 'order-1 lg:order-2' : 'order-1')}>{mockup}</div>
    </Reveal>
  );
}

type Progress = MotionValue<number>;

function RailDot({ progress, at }: { progress: Progress; at: number }) {
  const backgroundColor = useTransform(progress, [at - 0.02, at + 0.02], ['rgba(255,255,255,0.2)', 'rgba(238,122,58,1)']);
  return (
    <motion.span
      className="absolute -left-[5px] size-[11px] rounded-full border-2 border-[var(--brand-700)]"
      style={{ top: `${at * 100}%`, backgroundColor }}
    />
  );
}

/** Vertical rail in the left gutter that fills as the reader moves through the three steps (desktop). */
function ProgressRail({ progress }: { progress: Progress }) {
  return (
    <div aria-hidden="true" className="absolute -left-10 top-0 hidden h-full w-px bg-white/10 xl:block">
      <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-[var(--accent-500)]" style={{ scaleY: progress }} />
      {[0.08, 0.5, 0.92].map((at) => (
        <RailDot key={at} progress={progress} at={at} />
      ))}
    </div>
  );
}

export function HowItWorksSection() {
  const { formatMessage } = useIntl();
  const reduced = useReducedMotion();
  const stepsRef = useRef<HTMLDivElement>(null);
  const container = useScrollContainer(stepsRef);
  const { scrollYProgress } = useScroll({ container, target: stepsRef, offset: ['start 0.75', 'end 0.6'] });
  const progress = useTransform(scrollYProgress, (v) => (reduced ? 1 : v));

  return (
    <section id="comment-ca-marche" className="scroll-mt-20 bg-[var(--brand-700)] px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-20 text-center">
          <h2 className="mb-4 font-display text-4xl font-extrabold text-white lg:text-5xl">{formatMessage({ id: 'how.title' })}</h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70">{formatMessage({ id: 'how.subtitle' })}</p>
        </Reveal>
        <div ref={stepsRef} className="relative flex flex-col gap-20">
          <ProgressRail progress={progress} />
          <Step number="01" id="step1" mockup={<ScenarioPickerMockup />} mockupRight />
          <Step number="02" id="step2" mockup={<DecisionBoardMockup />} mockupRight={false} />
          <Step number="03" id="step3" mockup={<ReportRadarMockup />} mockupRight />
        </div>
      </div>
    </section>
  );
}
