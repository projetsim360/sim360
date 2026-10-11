import type { TenantPlan } from '@prisma/client';

/**
 * Quotas per plan, mirroring the public pricing grid
 * (apps/webapp/src/features/landing/content/pricing.ts and the pricing.plan.* messages).
 * `null` means unlimited. Change both places together.
 */
export interface PlanLimits {
  /** Written (TEXT) meetings a learner can start per calendar month. */
  textMeetingsPerMonth: number | null;
  /** Voice (AUDIO) meetings a learner can start per calendar month. 0 = not included. */
  voiceMeetingsPerMonth: number | null;
  /** Meetings planned by the learner (custom cast and objectives). */
  customMeetings: boolean;
}

export const PLAN_LIMITS: Record<TenantPlan, PlanLimits> = {
  FREE: { textMeetingsPerMonth: 5, voiceMeetingsPerMonth: 0, customMeetings: false },
  STARTER: { textMeetingsPerMonth: null, voiceMeetingsPerMonth: 4, customMeetings: false },
  PRO: { textMeetingsPerMonth: null, voiceMeetingsPerMonth: null, customMeetings: true },
  ENTERPRISE: { textMeetingsPerMonth: null, voiceMeetingsPerMonth: null, customMeetings: true },
};

export const PLAN_RANK: Record<TenantPlan, number> = { FREE: 0, STARTER: 1, PRO: 2, ENTERPRISE: 3 };

/** Learner-facing plan names, as on the pricing grid. */
export const PLAN_LABEL: Record<TenantPlan, string> = {
  FREE: 'Découverte',
  STARTER: 'Apprenant',
  PRO: 'Professionnel',
  ENTERPRISE: 'Équipe',
};

export type MeetingMode = 'TEXT' | 'AUDIO';

export function includesPlan(current: TenantPlan, required: TenantPlan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

export function monthlyLimit(plan: TenantPlan, mode: MeetingMode): number | null {
  const limits = PLAN_LIMITS[plan];
  return mode === 'AUDIO' ? limits.voiceMeetingsPerMonth : limits.textMeetingsPerMonth;
}

/** Remaining starts for the month, or null when unlimited. Never negative. */
export function remaining(limit: number | null, used: number): number | null {
  return limit === null ? null : Math.max(0, limit - used);
}

/**
 * First instant of the current calendar month in `timeZone` (default America/Toronto, the
 * Québec civil time), returned as a UTC Date for database comparisons.
 */
export function startOfMonth(now: Date, timeZone = 'America/Toronto'): Date {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  // Midnight local on the 1st: start from midnight UTC and correct by the zone offset at that instant.
  const guess = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const offsetMinutes = zoneOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offsetMinutes * 60_000);
}

function zoneOffsetMinutes(at: Date, timeZone: string): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(at)
      .map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour), Number(p.minute), Number(p.second));
  return Math.round((asUtc - at.getTime()) / 60_000);
}
