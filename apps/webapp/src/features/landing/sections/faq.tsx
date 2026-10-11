import { FormattedMessage, useIntl } from 'react-intl';
import { ChevronDown } from 'lucide-react';
import { Reveal } from '../components/reveal';

const CONTACT_EMAIL = 'hello@simex.pro';
const QUESTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function FaqSection() {
  const { formatMessage } = useIntl();
  return (
    <section id="faq" className="scroll-mt-20 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-400)]">{formatMessage({ id: 'faq.kicker' })}</p>
          <h2 className="mb-4 font-display text-4xl font-extrabold text-foreground lg:text-5xl">{formatMessage({ id: 'faq.title' })}</h2>
          <p className="text-lg text-muted-foreground">
            <FormattedMessage
              id="faq.subtitle"
              values={{
                email: (
                  <a key="email" href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--accent-400)] hover:underline">
                    {CONTACT_EMAIL}
                  </a>
                ),
              }}
            />
          </p>
        </Reveal>

        <div className="space-y-3">
          {QUESTIONS.map((n) => (
            <details
              key={n}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-[var(--accent-500)]/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="text-[15px] font-semibold text-foreground lg:text-base">{formatMessage({ id: `faq.q${n}` })}</span>
                <ChevronDown size={20} className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="px-6 pb-5 text-[15px] leading-relaxed text-muted-foreground">{formatMessage({ id: `faq.a${n}` })}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
