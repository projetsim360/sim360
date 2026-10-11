import { useIntl } from 'react-intl';
import { Award, Sparkles, UserCheck, type LucideIcon } from 'lucide-react';
import { Reveal } from '../components/reveal';

const PILLARS: { id: 'pillar1' | 'pillar2' | 'pillar3'; icon: LucideIcon }[] = [
  { id: 'pillar1', icon: Sparkles },
  { id: 'pillar2', icon: UserCheck },
  { id: 'pillar3', icon: Award },
];

export function WhySection() {
  const { formatMessage } = useIntl();
  return (
    <section className="bg-card px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center">
          <h2 className="font-display text-4xl font-extrabold text-foreground">{formatMessage({ id: 'why.title' })}</h2>
        </Reveal>
        <div className="grid gap-12 md:grid-cols-3">
          {PILLARS.map(({ id, icon: Icon }, i) => (
            <Reveal key={id} delay={i * 0.08} className="text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-[var(--accent-500)]/30 bg-[var(--accent-500)]/20 text-[var(--accent-400)]">
                <Icon size={28} aria-hidden="true" />
              </div>
              <h3 className="mb-3 font-display text-xl font-bold text-foreground">{formatMessage({ id: `why.${id}.title` })}</h3>
              <p className="leading-relaxed text-muted-foreground">{formatMessage({ id: `why.${id}.text` })}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
