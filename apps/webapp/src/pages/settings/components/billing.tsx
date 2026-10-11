import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useT, useTv } from '@/i18n/app/use-t';
import { useAppLocale } from '@/providers/locale-provider';
import { PUBLIC_PLANS, formatCad, planPrice, type BillingPeriod } from '@/features/landing/content/pricing';

type PaidPlan = 'STARTER' | 'PRO';

interface BillingStatus {
  enabled: boolean;
  offers: Array<{ plan: PaidPlan; period: BillingPeriod }>;
  plan: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  canManage: boolean;
}

interface PlanUsage {
  plan: string;
}

const PILL = 'px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors';

/** Same set as ACTIVE_STATUSES in the API: a live subscription blocks a new checkout. */
const LIVE_STATUSES = new Set(['active', 'trialing', 'past_due', 'incomplete']);

/**
 * Personal subscription (Stripe Checkout, CAD). Prices come from the public grid so the
 * landing page and this section always agree; the plan itself is only ever set by the
 * server after Stripe confirms the payment.
 */
export function Billing() {
  const t = useT();
  const tv = useTv();
  const { locale, intlLocale } = useAppLocale();
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  const status = useQuery({ queryKey: ['billing', 'status'], queryFn: () => api.get<BillingStatus>('/billing/status') });
  const usage = useQuery({ queryKey: ['plans', 'usage'], queryFn: () => api.get<PlanUsage>('/plans/usage') });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get('checkout');
    if (!result) return;
    if (result === 'success') toast.success(t('billing.checkoutSuccess'));
    else toast(t('billing.checkoutCancel'));
    params.delete('checkout');
    const query = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
  }, [t]);

  /** Server messages are French-only: map the known cases to the catalogue. */
  const onError = (e: { status?: number }) =>
    toast.error(t(e.status === 409 ? 'billing.alreadySubscribed' : 'billing.error'));

  const redirect = (r: { url: string }) => {
    window.location.href = r.url;
  };
  const checkout = useMutation({
    mutationFn: (plan: PaidPlan) => api.post<{ url: string }>('/billing/checkout', { plan, period }),
    onSuccess: redirect,
    onError,
  });
  const portal = useMutation({
    mutationFn: () => api.post<{ url: string }>('/billing/portal'),
    onSuccess: redirect,
    onError,
  });

  const data = status.data;
  const currentPlan = usage.data?.plan ?? data?.plan ?? 'FREE';
  const hasSubscription = !!data?.subscriptionStatus && LIVE_STATUSES.has(data.subscriptionStatus);
  const offers = data?.enabled && !hasSubscription ? data.offers.filter((o) => o.period === period) : [];
  const periods = Array.from(new Set(data?.offers.map((o) => o.period) ?? [])) as BillingPeriod[];

  return (
    <Card
      id="billing"
      className="border-[var(--neutral-100)] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(15,26,46,0.04),0_8px_24px_-10px_rgba(15,26,46,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-10px_rgba(0,0,0,0.5)]"
    >
      <CardHeader className="flex-col items-start gap-1 pt-5 pb-4 border-b-0">
        <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-[var(--accent-700)] dark:text-[var(--accent-300)]">
          {t('settings.kicker.account')}
        </span>
        <h2 className="font-display text-[19px] font-bold text-foreground m-0">{t('billing.title')}</h2>
        <p className="text-[13px] text-muted-foreground m-0">{t('billing.desc')}</p>
      </CardHeader>

      <CardContent className="pt-2 flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[13px] text-muted-foreground">{t('billing.current')}</span>
          <Badge variant="primary" appearance="light">{tv('billing.plan', currentPlan)}</Badge>
          {hasSubscription && data?.subscriptionStatus && (
            <Badge variant={data.subscriptionStatus === 'past_due' ? 'destructive' : 'success'} appearance="light">
              {tv('billing.status', data.subscriptionStatus)}
            </Badge>
          )}
          {hasSubscription && data?.currentPeriodEnd && (
            <span className="text-[12px] text-muted-foreground">
              {t('billing.renews', { date: new Date(data.currentPeriodEnd).toLocaleDateString(intlLocale, { day: 'numeric', month: 'long', year: 'numeric' }) })}
            </span>
          )}
        </div>

        {status.isSuccess && !data?.enabled && <p className="text-[13px] text-muted-foreground m-0">{t('billing.disabled')}</p>}

        {data?.enabled && !hasSubscription && periods.length > 1 && (
          <div className="inline-flex w-fit gap-1 rounded-lg bg-muted p-1" role="group" aria-label={t('billing.period')}>
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
                className={cn(PILL, period === p ? 'bg-card text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)]' : 'text-muted-foreground hover:text-foreground')}
              >
                {t(p === 'monthly' ? 'billing.monthly' : 'billing.annual')}
              </button>
            ))}
          </div>
        )}

        {offers.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {offers.map(({ plan }) => {
              const grid = PUBLIC_PLANS.find((p) => p.tenantPlan === plan);
              const price = grid ? planPrice(grid, period) : null;
              const isCurrent = currentPlan === plan;
              return (
                <div key={plan} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-foreground">{tv('billing.plan', plan)}</span>
                    {price && (
                      <span className="text-sm text-foreground">
                        <strong className="text-lg">{formatCad(price.perMonthCents, locale)}</strong> {t('billing.perMonth')}
                      </span>
                    )}
                  </div>
                  {price && period === 'annual' && (
                    <span className="text-[12px] text-muted-foreground">{t('billing.billedYearly', { total: formatCad(price.totalCents, locale) })}</span>
                  )}
                  <span className="text-[12px] text-muted-foreground">{t('billing.taxes')}</span>
                  <Button
                    size="sm"
                    variant={plan === 'PRO' ? 'primary' : 'outline'}
                    disabled={isCurrent || checkout.isPending}
                    onClick={() => checkout.mutate(plan)}
                  >
                    {isCurrent ? t('billing.currentShort') : checkout.isPending && checkout.variables === plan ? t('billing.redirecting') : t('billing.choose')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {data?.canManage && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--neutral-100)] pt-4 dark:border-white/[0.06]">
            <span className="text-[13px] text-muted-foreground">{t('billing.manageDesc')}</span>
            <Button size="sm" variant="outline" disabled={portal.isPending} onClick={() => portal.mutate()}>
              {portal.isPending ? t('billing.redirecting') : t('billing.manage')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
