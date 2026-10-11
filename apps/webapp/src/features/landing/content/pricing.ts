/**
 * Public pricing grid: single source of truth for the landing page.
 * Pure data and formatting helpers (no React) so unit tests can import it directly.
 *
 * Amounts are in Canadian cents, taxes excluded (GST/QST are added at billing time).
 * Each public plan maps to a `TenantPlan` value of the Prisma schema; the limits
 * shown here must match the quotas the API enforces before they are published.
 */

import type { PublicLocale } from '../../../i18n/public-locale';

export type PublicPlanId = 'free' | 'starter' | 'pro' | 'enterprise';
export type TenantPlanCode = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
export type BillingPeriod = 'monthly' | 'annual';

/** Annual billing charges 10 months: "2 months free". */
export const ANNUAL_MONTHS_CHARGED = 10;

export interface PublicPlan {
  id: PublicPlanId;
  tenantPlan: TenantPlanCode;
  /** Monthly price in CAD cents; null for quote-based plans. */
  monthlyCents: number | null;
  /** Quote-based plans advertise a per-seat starting price instead. */
  perSeat?: { fromCents: number; minSeats: number };
  featured: boolean;
  /** Number of `pricing.plan.<id>.feature.<n>` messages to render. */
  featureCount: number;
  cta: 'signup' | 'start' | 'contact';
}

export const PUBLIC_PLANS: readonly PublicPlan[] = [
  { id: 'free', tenantPlan: 'FREE', monthlyCents: 0, featured: false, featureCount: 5, cta: 'signup' },
  { id: 'starter', tenantPlan: 'STARTER', monthlyCents: 1900, featured: false, featureCount: 5, cta: 'start' },
  { id: 'pro', tenantPlan: 'PRO', monthlyCents: 4900, featured: true, featureCount: 7, cta: 'start' },
  {
    id: 'enterprise',
    tenantPlan: 'ENTERPRISE',
    monthlyCents: null,
    perSeat: { fromCents: 2900, minSeats: 10 },
    featured: false,
    featureCount: 6,
    cta: 'contact',
  },
];

export interface PlanPrice {
  /** What the big number shows: the monthly price, or the monthly equivalent when billed annually. */
  perMonthCents: number;
  /** What is actually charged per billing period. */
  totalCents: number;
  period: BillingPeriod;
}

/** Price of a plan for a billing period, or null for quote-based plans. */
export function planPrice(plan: PublicPlan, period: BillingPeriod): PlanPrice | null {
  if (plan.monthlyCents === null) return null;
  if (period === 'monthly') return { perMonthCents: plan.monthlyCents, totalCents: plan.monthlyCents, period };
  const totalCents = plan.monthlyCents * ANNUAL_MONTHS_CHARGED;
  return { perMonthCents: Math.round(totalCents / 12), totalCents, period };
}

/**
 * Formats CAD cents for the public locale: `fr-CA` → « 19 $ », `en-CA` → "$19".
 * Cents are shown only when the amount is not a whole dollar (15,83 $).
 */
export function formatCad(cents: number, locale: PublicLocale): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(locale === 'en' ? 'en-CA' : 'fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
