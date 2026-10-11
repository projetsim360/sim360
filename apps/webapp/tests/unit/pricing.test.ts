import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANNUAL_MONTHS_CHARGED, formatCad, planPrice, PUBLIC_PLANS } from '../../src/features/landing/content/pricing';

/** Intl inserts non-breaking spaces; compare on plain spaces. */
const plain = (s: string) => s.replace(/\s/g, ' ');

test('CAD amounts follow Canadian French and English conventions', () => {
  assert.equal(plain(formatCad(1900, 'fr')), '19 $');
  assert.equal(plain(formatCad(1900, 'en')), '$19');
  assert.equal(plain(formatCad(1583, 'fr')), '15,83 $');
  assert.equal(plain(formatCad(1583, 'en')), '$15.83');
  assert.equal(plain(formatCad(0, 'fr')), '0 $');
});

test('every TenantPlan has exactly one public plan', () => {
  const codes = PUBLIC_PLANS.map((p) => p.tenantPlan).sort();
  assert.deepEqual(codes, ['ENTERPRISE', 'FREE', 'PRO', 'STARTER']);
  assert.equal(PUBLIC_PLANS.filter((p) => p.featured).length, 1);
});

test('annual billing charges 10 months and shows the monthly equivalent', () => {
  const pro = PUBLIC_PLANS.find((p) => p.id === 'pro')!;
  assert.deepEqual(planPrice(pro, 'monthly'), { perMonthCents: 4900, totalCents: 4900, period: 'monthly' });
  const annual = planPrice(pro, 'annual')!;
  assert.equal(annual.totalCents, 4900 * ANNUAL_MONTHS_CHARGED);
  assert.equal(annual.perMonthCents, Math.round((4900 * 10) / 12));
});

test('quote-based plans have no price but a per-seat starting point', () => {
  const team = PUBLIC_PLANS.find((p) => p.id === 'enterprise')!;
  assert.equal(planPrice(team, 'monthly'), null);
  assert.equal(planPrice(team, 'annual'), null);
  assert.ok(team.perSeat && team.perSeat.fromCents > 0 && team.perSeat.minSeats >= 1);
});
