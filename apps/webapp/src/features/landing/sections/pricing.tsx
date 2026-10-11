import { useState } from 'react';
import { Link } from 'react-router';
import { useIntl } from 'react-intl';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicSession } from '../providers/public-session';
import { cn } from '@/lib/utils';
import { Reveal } from '../components/reveal';
import { usePublicLocale } from '../hooks/use-public-locale';
import { formatCad, planPrice, PUBLIC_PLANS, type BillingPeriod, type PublicPlan } from '../content/pricing';

const CONTACT_HREF = 'mailto:hello@simex.pro';

function BillingToggle({ period, onChange }: { period: BillingPeriod; onChange: (p: BillingPeriod) => void }) {
  const { formatMessage } = useIntl();
  const option = (value: BillingPeriod, labelId: 'pricing.billing.monthly' | 'pricing.billing.annual') => (
    <button
      type="button"
      role="radio"
      aria-checked={period === value}
      onClick={() => onChange(value)}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        period === value ? 'bg-[var(--accent-500)] text-[var(--brand-900)] shadow-sm' : 'text-foreground/70 hover:text-foreground',
      )}
    >
      {formatMessage({ id: labelId })}
    </button>
  );
  return (
    <div className="mt-8 inline-flex items-center gap-3">
      <div role="radiogroup" aria-label={formatMessage({ id: 'pricing.billing.monthly' })} className="inline-flex rounded-full border border-border bg-card p-1">
        {option('monthly', 'pricing.billing.monthly')}
        {option('annual', 'pricing.billing.annual')}
      </div>
      <span className="rounded-full bg-[var(--success-500)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--success-500)]">
        {formatMessage({ id: 'pricing.billing.annualSave' })}
      </span>
    </div>
  );
}

function PlanPrice({ plan, period }: { plan: PublicPlan; period: BillingPeriod }) {
  const { formatMessage } = useIntl();
  const locale = usePublicLocale();
  const price = planPrice(plan, period);

  if (!price) {
    return (
      <div className="mb-6">
        <span className="font-display text-4xl font-extrabold text-foreground">{formatMessage({ id: 'pricing.custom' })}</span>
        {plan.perSeat && (
          <p className="mt-2 text-sm text-muted-foreground">
            {formatMessage({ id: 'pricing.fromPerSeat' }, { price: formatCad(plan.perSeat.fromCents, locale), seats: plan.perSeat.minSeats })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <span className="font-display text-5xl font-extrabold text-foreground">{formatCad(price.perMonthCents, locale)}</span>
      <span className="ml-1 text-sm text-muted-foreground">{formatMessage({ id: 'pricing.perMonth' })}</span>
      <p className={cn('mt-2 text-xs text-muted-foreground', (price.period !== 'annual' || price.totalCents === 0) && 'invisible')}>
        {formatMessage({ id: 'pricing.billedAnnually' }, { total: formatCad(price.totalCents, locale) })}
      </p>
    </div>
  );
}

function PlanCta({ plan }: { plan: PublicPlan }) {
  const { formatMessage } = useIntl();
  const { user } = usePublicSession();
  const variant = plan.featured ? 'primary' : 'outline';
  const tone = plan.featured ? 'bg-[var(--accent-500)] text-[var(--brand-900)] hover:bg-[var(--accent-400)] hover:text-[var(--brand-900)]' : '';

  if (plan.cta === 'contact') {
    return (
      <Button asChild variant={variant} size="sm" className={cn('w-full', tone)}>
        <a href={CONTACT_HREF}>{formatMessage({ id: 'pricing.cta.contact' })}</a>
      </Button>
    );
  }
  if (user) {
    return (
      <Button asChild variant={variant} size="sm" className={cn('w-full', tone)}>
        <Link to="/dashboard">{formatMessage({ id: 'nav.dashboard' })}</Link>
      </Button>
    );
  }
  return (
    <Button asChild variant={variant} size="sm" className={cn('w-full', tone)}>
      <Link to="/auth/sign-up">{formatMessage({ id: plan.cta === 'signup' ? 'pricing.cta.signup' : 'pricing.cta.start' })}</Link>
    </Button>
  );
}

export function PricingSection() {
  const { formatMessage } = useIntl();
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  return (
    <section id="tarifs" className="scroll-mt-20 bg-background px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-14 text-center">
          <h2 className="font-display text-4xl font-extrabold text-foreground">{formatMessage({ id: 'pricing.title' })}</h2>
          <p className="mt-3 text-muted-foreground">{formatMessage({ id: 'pricing.subtitle' })}</p>
          <BillingToggle period={period} onChange={setPeriod} />
        </Reveal>

        <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PUBLIC_PLANS.map((plan, i) => (
            <Reveal
              key={plan.id}
              delay={i * 0.06}
              className={cn(
                'relative rounded-2xl border bg-card p-8',
                plan.featured ? 'border-2 border-[var(--accent-500)] xl:scale-[1.02]' : 'border-border',
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--accent-500)] px-3 py-1 text-xs font-bold uppercase text-white">
                  {formatMessage({ id: 'pricing.mostPopular' })}
                </div>
              )}
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--accent-600)]">{formatMessage({ id: `pricing.plan.${plan.id}.name` })}</p>
              <PlanPrice plan={plan} period={period} />
              <ul className="mb-8 space-y-3">
                {Array.from({ length: plan.featureCount }, (_, n) => n + 1).map((n) => (
                  <li key={n} className="flex items-start gap-3 text-sm text-foreground/80">
                    <Check size={16} className="mt-0.5 shrink-0 text-[var(--accent-500)]" aria-hidden="true" />
                    <span>{formatMessage({ id: `pricing.plan.${plan.id}.feature.${n}` })}</span>
                  </li>
                ))}
              </ul>
              <PlanCta plan={plan} />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">{formatMessage({ id: 'pricing.taxes' })}</p>
      </div>
    </section>
  );
}
