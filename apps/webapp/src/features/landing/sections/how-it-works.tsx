import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from '../components/reveal';
import { ScenarioPickerMockup } from '../components/mockups/scenario-picker';
import { DecisionBoardMockup } from '../components/mockups/decision-board';
import { ReportRadarMockup } from '../components/mockups/report-radar';

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
        <span
          className="block font-display text-[80px] font-extrabold leading-none tracking-tighter text-transparent"
          style={{ WebkitTextStroke: '1px var(--accent-500)' }}
          aria-hidden="true"
        >
          {number}
        </span>
        <h3 className="font-display text-3xl font-bold text-white lg:text-4xl">{formatMessage({ id: `how.${id}.title` })}</h3>
        <p className="text-lg leading-relaxed text-white/70">{formatMessage({ id: `how.${id}.text` })}</p>
        <ul className="space-y-2.5 text-[15px] text-white/85">
          {points.map((n) => (
            <li key={n} className="flex items-start gap-3">
              <Check size={18} className="mt-0.5 shrink-0 text-[var(--accent-400)]" aria-hidden="true" />
              {formatMessage({ id: `how.${id}.point.${n}` })}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn(mockupRight ? 'order-1 lg:order-2' : 'order-1')}>{mockup}</div>
    </Reveal>
  );
}

export function HowItWorksSection() {
  const { formatMessage } = useIntl();
  return (
    <section id="comment-ca-marche" className="scroll-mt-20 bg-[var(--brand-700)] px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <h2 className="mb-4 font-display text-4xl font-extrabold text-white lg:text-5xl">{formatMessage({ id: 'how.title' })}</h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70">{formatMessage({ id: 'how.subtitle' })}</p>
        </div>
        <div className="flex flex-col gap-20">
          <Step number="01" id="step1" mockup={<ScenarioPickerMockup />} mockupRight />
          <Step number="02" id="step2" mockup={<DecisionBoardMockup />} mockupRight={false} />
          <Step number="03" id="step3" mockup={<ReportRadarMockup />} mockupRight />
        </div>
      </div>
    </section>
  );
}
