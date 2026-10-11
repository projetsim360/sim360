import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ForbiddenException } from '@nestjs/common';
import { PLAN_LIMITS, includesPlan, monthlyLimit, remaining, startOfMonth } from '../src/modules/plans/plan-limits';
import { PlanQuotaService, PLAN_QUOTA_ERROR } from '../src/modules/plans/plan-quota.service';

test('limits mirror the pricing grid', () => {
  assert.equal(monthlyLimit('FREE', 'TEXT'), 5);
  assert.equal(monthlyLimit('FREE', 'AUDIO'), 0);
  assert.equal(monthlyLimit('STARTER', 'TEXT'), null);
  assert.equal(monthlyLimit('STARTER', 'AUDIO'), 4);
  assert.equal(monthlyLimit('PRO', 'AUDIO'), null);
  assert.equal(PLAN_LIMITS.STARTER.customMeetings, false);
  assert.equal(PLAN_LIMITS.PRO.customMeetings, true);
});

test('plan hierarchy and remaining starts', () => {
  assert.ok(includesPlan('PRO', 'STARTER'));
  assert.ok(includesPlan('FREE', 'FREE'));
  assert.ok(!includesPlan('STARTER', 'PRO'));
  assert.equal(remaining(5, 2), 3);
  assert.equal(remaining(5, 9), 0);
  assert.equal(remaining(null, 40), null);
});

test('month starts at local midnight in Québec, across DST', () => {
  // 15 Oct 2026, EDT (UTC-4): 1 Oct 00:00 local = 04:00 UTC
  assert.equal(startOfMonth(new Date('2026-10-15T12:00:00Z')).toISOString(), '2026-10-01T04:00:00.000Z');
  // 10 Jan 2027, EST (UTC-5)
  assert.equal(startOfMonth(new Date('2027-01-10T12:00:00Z')).toISOString(), '2027-01-01T05:00:00.000Z');
  // 1 Nov 2026 02:00 UTC is still 31 Oct 22:00 in Montréal: month is October
  assert.equal(startOfMonth(new Date('2026-11-01T02:00:00Z')).toISOString(), '2026-10-01T04:00:00.000Z');
});

function fakeService(opts: { plan: string; enforced: boolean; started?: Record<string, number>; userPlan?: string | null }) {
  const calls: unknown[] = [];
  const prisma = {
    tenant: { findUnique: async () => ({ plan: opts.plan }) },
    user: { findUnique: async () => ({ plan: opts.userPlan ?? null }) },
    meeting: {
      count: async (args: { where: { mode: string; simulation: unknown } }) => {
        calls.push(args.where);
        return opts.started?.[args.where.mode] ?? 0;
      },
    },
  };
  const config = { get: (k: string) => (k === 'PLAN_QUOTAS_ENFORCED' && opts.enforced ? 'true' : undefined) };
  return { svc: new PlanQuotaService(prisma as never, config as never), calls };
}

async function rejectsQuota(p: Promise<unknown>) {
  await assert.rejects(p, (e: unknown) => e instanceof ForbiddenException && String((e as Error).message).startsWith(PLAN_QUOTA_ERROR));
}

test('nothing is blocked while enforcement is off (pilot)', async () => {
  const { svc } = fakeService({ plan: 'FREE', enforced: false, started: { TEXT: 50 } });
  await svc.assertCanStartMeeting('t1', 'u1', 'TEXT');
  await svc.assertCanStartMeeting('t1', 'u1', 'AUDIO');
  await svc.assertCanUseScenario('t1', 'PRO');
  await svc.assertCanCreateCustomMeeting('t1');
});

test('free plan: fifth written meeting allowed, sixth refused, voice refused', async () => {
  const under = fakeService({ plan: 'FREE', enforced: true, started: { TEXT: 4 } });
  await under.svc.assertCanStartMeeting('t1', 'u1', 'TEXT');
  const at = fakeService({ plan: 'FREE', enforced: true, started: { TEXT: 5 } });
  await rejectsQuota(at.svc.assertCanStartMeeting('t1', 'u1', 'TEXT'));
  await rejectsQuota(at.svc.assertCanStartMeeting('t1', 'u1', 'AUDIO'));
});

test('starter: unlimited written, four voice meetings', async () => {
  const { svc } = fakeService({ plan: 'STARTER', enforced: true, started: { TEXT: 300, AUDIO: 3 } });
  await svc.assertCanStartMeeting('t1', 'u1', 'TEXT');
  await svc.assertCanStartMeeting('t1', 'u1', 'AUDIO');
  const full = fakeService({ plan: 'STARTER', enforced: true, started: { AUDIO: 4 } });
  await rejectsQuota(full.svc.assertCanStartMeeting('t1', 'u1', 'AUDIO'));
});

test('scenario access and custom meetings follow the plan', async () => {
  const starter = fakeService({ plan: 'STARTER', enforced: true });
  await starter.svc.assertCanUseScenario('t1', 'STARTER');
  await rejectsQuota(starter.svc.assertCanUseScenario('t1', 'PRO'));
  await rejectsQuota(starter.svc.assertCanCreateCustomMeeting('t1'));
  const pro = fakeService({ plan: 'PRO', enforced: true });
  await pro.svc.assertCanCreateCustomMeeting('t1');
});

test('usage counts only this tenant and user since the month start', async () => {
  const { svc, calls } = fakeService({ plan: 'STARTER', enforced: false, started: { TEXT: 7, AUDIO: 1 } });
  const u = await svc.usage('tenant-a', 'user-a', new Date('2026-10-15T12:00:00Z'));
  assert.equal(u.planLabel, 'Apprenant');
  assert.equal(u.enforced, false);
  assert.deepEqual(u.voiceMeetings, { used: 1, limit: 4, remaining: 3 });
  assert.deepEqual(u.textMeetings, { used: 7, limit: null, remaining: null });
  for (const where of calls as Array<{ simulation: unknown; startedAt: { gte: Date } }>) {
    assert.deepEqual(where.simulation, { tenantId: 'tenant-a', userId: 'user-a' });
    assert.equal(where.startedAt.gte.toISOString(), '2026-10-01T04:00:00.000Z');
  }
});

test('a personal subscription lifts the plan above the shared tenant plan', async () => {
  const learner = fakeService({ plan: 'FREE', userPlan: 'PRO', enforced: true, started: { TEXT: 40, AUDIO: 9 } });
  await learner.svc.assertCanStartMeeting('t1', 'u1', 'AUDIO');
  await learner.svc.assertCanCreateCustomMeeting('t1', 'u1');
  await learner.svc.assertCanUseScenario('t1', 'PRO', 'u1');
  assert.equal((await learner.svc.usage('t1', 'u1')).plan, 'PRO');
});

test('a team tenant plan wins over a lower personal plan', async () => {
  const member = fakeService({ plan: 'ENTERPRISE', userPlan: 'STARTER', enforced: true });
  assert.equal((await member.svc.usage('t1', 'u1')).plan, 'ENTERPRISE');
});
