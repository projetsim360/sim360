import type { TenantPlan } from '@prisma/client';
import type Stripe from 'stripe';

/**
 * Billing configuration and pure rules (no Nest, no network) so they can be unit-tested.
 *
 * Billing is optional: with no STRIPE_SECRET_KEY the API boots normally and every billing
 * endpoint reports `enabled: false`. Prices live in Stripe and must be CAD, with
 * `tax_behavior: exclusive` (the public grid shows amounts before GST/QST).
 */

export type PaidPlan = Extract<TenantPlan, 'STARTER' | 'PRO'>;
export type BillingPeriod = 'monthly' | 'annual';

export const PAID_PLANS: readonly PaidPlan[] = ['STARTER', 'PRO'];
export const BILLING_PERIODS: readonly BillingPeriod[] = ['monthly', 'annual'];

export interface BillingConfig {
  secretKey: string;
  webhookSecret: string | null;
  prices: Record<PaidPlan, Record<BillingPeriod, string | null>>;
  /** Stripe Tax computes GST, HST or QST from the buyer's address (recommended). */
  automaticTax: boolean;
  /** Fixed tax rates, used only when automatic tax is off. */
  taxRateIds: string[];
  appUrl: string;
}

type EnvReader = (key: string) => string | undefined;

/** Reads the STRIPE_* variables; returns null when billing is not configured. */
export function readBillingConfig(env: EnvReader, appUrl: string): BillingConfig | null {
  const secretKey = env('STRIPE_SECRET_KEY')?.trim();
  if (!secretKey) return null;
  const price = (key: string) => env(key)?.trim() || null;
  return {
    secretKey,
    webhookSecret: env('STRIPE_WEBHOOK_SECRET')?.trim() || null,
    prices: {
      STARTER: { monthly: price('STRIPE_PRICE_STARTER_MONTHLY'), annual: price('STRIPE_PRICE_STARTER_ANNUAL') },
      PRO: { monthly: price('STRIPE_PRICE_PRO_MONTHLY'), annual: price('STRIPE_PRICE_PRO_ANNUAL') },
    },
    automaticTax: (env('STRIPE_AUTOMATIC_TAX') ?? 'true').trim().toLowerCase() !== 'false',
    taxRateIds: (env('STRIPE_TAX_RATE_IDS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    appUrl: appUrl.replace(/\/+$/, ''),
  };
}

/** Plans and periods that have a Stripe price configured. */
export function availableOffers(config: BillingConfig): Array<{ plan: PaidPlan; period: BillingPeriod }> {
  return PAID_PLANS.flatMap((plan) =>
    BILLING_PERIODS.filter((period) => config.prices[plan][period]).map((period) => ({ plan, period })),
  );
}

/** Which plan a Stripe price unlocks, or null for a price this app does not know. */
export function planForPrice(config: BillingConfig, priceId: string | null | undefined): PaidPlan | null {
  if (!priceId) return null;
  for (const plan of PAID_PLANS) {
    if (BILLING_PERIODS.some((period) => config.prices[plan][period] === priceId)) return plan;
  }
  return null;
}

/**
 * Personal plan after a subscription change.
 * - active, trialing: the plan of the subscribed price;
 * - past_due, incomplete: unchanged while Stripe retries the payment;
 * - canceled, unpaid, incomplete_expired, paused: no personal plan (back to the tenant plan).
 * `undefined` means "leave the stored plan as is".
 */
export function planAfterStatus(
  status: string,
  pricePlan: PaidPlan | null,
): TenantPlan | null | undefined {
  switch (status) {
    case 'active':
    case 'trialing':
      return pricePlan ?? undefined;
    case 'canceled':
    case 'unpaid':
    case 'incomplete_expired':
    case 'paused':
      return null;
    default:
      return undefined;
  }
}

export interface CheckoutInput {
  userId: string;
  email: string;
  stripeCustomerId: string | null;
  plan: PaidPlan;
  period: BillingPeriod;
  locale: 'fr' | 'en';
}

/** Stripe Checkout parameters for a personal subscription. Throws if the price is missing. */
export function buildCheckoutParams(config: BillingConfig, input: CheckoutInput): Stripe.Checkout.SessionCreateParams {
  const price = config.prices[input.plan][input.period];
  if (!price) throw new Error(`No Stripe price configured for ${input.plan} ${input.period}`);
  const useFixedRates = !config.automaticTax && config.taxRateIds.length > 0;
  const metadata = { userId: input.userId, plan: input.plan, period: input.period };
  const back = `${config.appUrl}/settings`;
  return {
    mode: 'subscription',
    line_items: [{ price, quantity: 1, ...(useFixedRates ? { tax_rates: config.taxRateIds } : {}) }],
    client_reference_id: input.userId,
    metadata,
    subscription_data: { metadata },
    ...(input.stripeCustomerId
      ? {
          customer: input.stripeCustomerId,
          ...(config.automaticTax ? { customer_update: { address: 'auto' as const, name: 'auto' as const } } : {}),
        }
      : { customer_email: input.email }),
    billing_address_collection: config.automaticTax ? 'required' : 'auto',
    ...(config.automaticTax ? { automatic_tax: { enabled: true } } : {}),
    allow_promotion_codes: true,
    locale: input.locale === 'en' ? 'en' : 'fr-CA',
    success_url: `${back}?checkout=success#billing`,
    cancel_url: `${back}?checkout=cancel#billing`,
  };
}
