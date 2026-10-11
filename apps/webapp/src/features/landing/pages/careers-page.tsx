import { useIntl } from 'react-intl';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicPage } from '../components/public-page';
import { CONTACT_EMAIL } from '../components/contact-form';

export default function CareersPage() {
  const { formatMessage } = useIntl();
  return (
    <PublicPage id="careers">
      <div className="space-y-10">
        <section className="rounded-2xl border border-border bg-card p-8">
          <h2 className="font-display text-2xl font-bold text-foreground">{formatMessage({ id: 'careers.none.title' })}</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-foreground/80">{formatMessage({ id: 'careers.none.text' })}</p>
          <Button asChild variant="outline" size="md" className="mt-6">
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(formatMessage({ id: 'careers.cta' }))}`}>{formatMessage({ id: 'careers.cta' })}</a>
          </Button>
        </section>
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-foreground">{formatMessage({ id: 'careers.values.title' })}</h2>
          <ul className="space-y-3">
            {([1, 2, 3] as const).map((n) => (
              <li key={n} className="flex items-start gap-3 text-[17px] text-foreground/85">
                <Check size={18} className="mt-1 shrink-0 text-[var(--accent-400)]" aria-hidden="true" />
                {formatMessage({ id: `careers.values.${n}` })}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PublicPage>
  );
}
