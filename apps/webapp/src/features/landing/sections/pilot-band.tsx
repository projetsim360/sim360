import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicSession } from '../providers/public-session';
import { Reveal } from '../components/reveal';

const POINTS = ['pilot.point.1', 'pilot.point.2', 'pilot.point.3'] as const;

/**
 * Honest social proof while the platform is in pilot: what joining now gives, no borrowed
 * logos, no invented numbers (roadmap decision D1).
 */
export function PilotBand() {
  const { formatMessage } = useIntl();
  const { user } = usePublicSession();

  return (
    <section id="pilote" className="scroll-mt-20 border-y border-border bg-card/40 px-6 py-16 lg:px-8">
      <Reveal className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--accent-400)]">{formatMessage({ id: 'pilot.kicker' })}</p>
          <h2 className="font-display text-3xl font-extrabold text-foreground lg:text-4xl">{formatMessage({ id: 'pilot.title' })}</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{formatMessage({ id: 'pilot.text' })}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <ul className="space-y-3">
            {POINTS.map((id) => (
              <li key={id} className="flex items-start gap-3 text-[15px] text-foreground/85">
                <Check size={18} className="mt-0.5 shrink-0 text-[var(--accent-400)]" aria-hidden="true" />
                {formatMessage({ id })}
              </li>
            ))}
          </ul>
          {!user && (
            <Button asChild variant="primary" size="sm" className="mt-6 w-full bg-[var(--accent-500)] text-[var(--brand-900)] hover:bg-[var(--accent-400)] hover:text-[var(--brand-900)]">
              <Link to="/auth/sign-up">{formatMessage({ id: 'pilot.cta' })}</Link>
            </Button>
          )}
        </div>
      </Reveal>
    </section>
  );
}
