import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BadRequestException, ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import {
  availableOffers,
  buildCheckoutParams,
  planAfterStatus,
  planForPrice,
  readBillingConfig,
} from '../src/modules/billing/billing-config';
import { BillingService } from '../src/modules/billing/billing.service';

const ENV: Record<string, string> = {
  STRIPE_SECRET_KEY: 'sk_test_offline',
  STRIPE_WEBHOOK_SECRET: 'whsec_offline',
  STRIPE_PRICE_STARTER_MONTHLY: 'price_starter_m',
  STRIPE_PRICE_STARTER_ANNUAL: 'price_starter_y',
  STRIPE_PRICE_PRO_MONTHLY: 'price_pro_m',
  STRIPE_PRICE_PRO_ANNUAL: 'price_pro_y',
};
const config = readBillingConfig((k) => ENV[k], 'https://app.example.ca/')!;

test('billing is off without a secret key', () => {
  assert.equal(readBillingConfig(() => undefined, 'x'), null);
  assert.equal(readBillingConfig((k) => (k === 'STRIPE_SECRET_KEY' ? '  ' : undefined), 'x'), null);
});

test('config: automatic tax by default, offers follow configured prices', () => {
  assert.equal(config.automaticTax, true);
  assert.equal(config.appUrl, 'https://app.example.ca');
  assert.equal(availableOffers(config).length, 4);
  const partial = readBillingConfig((k) => ({ STRIPE_SECRET_KEY: 'sk', STRIPE_PRICE_PRO_MONTHLY: 'p' })[k], 'x')!;
  assert.deepEqual(availableOffers(partial), [{ plan: 'PRO', period: 'monthly' }]);
});

test('prices map to plans; unknown prices map to nothing', () => {
  assert.equal(planForPrice(config, 'price_pro_y'), 'PRO');
  assert.equal(planForPrice(config, 'price_starter_m'), 'STARTER');
  assert.equal(planForPrice(config, 'price_other'), null);
  assert.equal(planForPrice(config, undefined), null);
});

test('subscription status decides the personal plan', () => {
  assert.equal(planAfterStatus('active', 'PRO'), 'PRO');
  assert.equal(planAfterStatus('trialing', 'STARTER'), 'STARTER');
  assert.equal(planAfterStatus('past_due', 'PRO'), undefined);
  assert.equal(planAfterStatus('incomplete', 'PRO'), undefined);
  assert.equal(planAfterStatus('canceled', 'PRO'), null);
  assert.equal(planAfterStatus('unpaid', 'PRO'), null);
  assert.equal(planAfterStatus('active', null), undefined);
});

test('checkout: subscription in CAD prices, user metadata everywhere, Stripe Tax with a required address', () => {
  const p = buildCheckoutParams(config, { userId: 'u1', email: 'a@b.ca', stripeCustomerId: null, plan: 'PRO', period: 'annual', locale: 'fr' });
  assert.equal(p.mode, 'subscription');
  assert.deepEqual(p.line_items, [{ price: 'price_pro_y', quantity: 1 }]);
  assert.equal(p.client_reference_id, 'u1');
  assert.deepEqual(p.metadata, { userId: 'u1', plan: 'PRO', period: 'annual' });
  assert.deepEqual(p.subscription_data?.metadata, { userId: 'u1', plan: 'PRO', period: 'annual' });
  assert.deepEqual(p.automatic_tax, { enabled: true });
  assert.equal(p.billing_address_collection, 'required');
  assert.equal(p.customer_email, 'a@b.ca');
  assert.equal(p.customer, undefined);
  assert.equal(p.locale, 'fr-CA');
  assert.equal(p.success_url, 'https://app.example.ca/settings?checkout=success#billing');
  assert.equal(p.cancel_url, 'https://app.example.ca/settings?checkout=cancel#billing');
});

test('checkout: an existing customer keeps its address up to date for tax', () => {
  const p = buildCheckoutParams(config, { userId: 'u1', email: 'a@b.ca', stripeCustomerId: 'cus_1', plan: 'STARTER', period: 'monthly', locale: 'en' });
  assert.equal(p.customer, 'cus_1');
  assert.equal(p.customer_email, undefined);
  assert.deepEqual(p.customer_update, { address: 'auto', name: 'auto' });
  assert.equal(p.locale, 'en');
});

test('checkout: fixed tax rates only when automatic tax is off', () => {
  const fixed = readBillingConfig((k) => ({ ...ENV, STRIPE_AUTOMATIC_TAX: 'false', STRIPE_TAX_RATE_IDS: 'txr_gst, txr_qst' })[k], 'x')!;
  const p = buildCheckoutParams(fixed, { userId: 'u1', email: 'a@b.ca', stripeCustomerId: null, plan: 'PRO', period: 'monthly', locale: 'fr' });
  assert.deepEqual(p.line_items, [{ price: 'price_pro_m', quantity: 1, tax_rates: ['txr_gst', 'txr_qst'] }]);
  assert.equal(p.automatic_tax, undefined);
});

// ─── Service with fake Prisma and Stripe ───────────────────────────────

interface FakeUser {
  id: string;
  email: string;
  language?: string | null;
  plan?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionStatus?: string | null;
  currentPeriodEnd?: Date | null;
}

function fakePrisma(users: FakeUser[]) {
  const events = new Set<string>();
  const find = (where: Record<string, unknown>) =>
    users.find((u) => Object.entries(where).every(([k, v]) => (u as unknown as Record<string, unknown>)[k] === v)) ?? null;
  const user = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => find(where),
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => Object.assign(find(where)!, data),
  };
  const billingEvent = {
    create: async ({ data }: { data: { stripeEventId: string } }) => {
      if (events.has(data.stripeEventId)) {
        throw new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test', meta: { target: ['stripeEventId'] } });
      }
      events.add(data.stripeEventId);
    },
  };
  return {
    user,
    billingEvent,
    events,
    // Interactive transaction: run on the same fakes (enough for these tests).
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn({ user, billingEvent }),
  };
}

const realStripe = new Stripe('sk_test_offline');

function service(users: FakeUser[], env: Record<string, string> = ENV) {
  const prisma = fakePrisma(users);
  const created: Stripe.Checkout.SessionCreateParams[] = [];
  const fakeStripe = {
    checkout: { sessions: { create: async (p: Stripe.Checkout.SessionCreateParams) => (created.push(p), { url: 'https://checkout.stripe.test/s1' }) } },
    billingPortal: { sessions: { create: async () => ({ url: 'https://billing.stripe.test/p1' }) } },
    webhooks: realStripe.webhooks,
  };
  const configService = { get: (k: string) => (k === 'app.appUrl' ? 'https://app.example.ca' : env[k]) };
  const svc = new BillingService(prisma as never, configService as never, fakeStripe as never);
  return { svc, prisma, created, users };
}

function signed(event: object) {
  const payload = JSON.stringify(event);
  const header = realStripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_offline' });
  return { body: Buffer.from(payload), header };
}

test('service is inert without keys', async () => {
  const { svc } = service([{ id: 'u1', email: 'a@b.ca' }], {});
  assert.equal(svc.enabled, false);
  assert.equal((await svc.status('u1')).enabled, false);
  await assert.rejects(svc.createCheckout('u1', 'PRO', 'monthly'), ServiceUnavailableException);
  await assert.rejects(svc.handleWebhook(Buffer.from('{}'), 'sig'), ServiceUnavailableException);
});

test('checkout uses the user language and refuses a second active subscription', async () => {
  const { svc, created } = service([
    { id: 'u1', email: 'a@b.ca', language: 'en' },
    { id: 'u2', email: 'c@d.ca', stripeSubscriptionId: 'sub_x', subscriptionStatus: 'active' },
  ]);
  assert.deepEqual(await svc.createCheckout('u1', 'PRO', 'monthly'), { url: 'https://checkout.stripe.test/s1' });
  assert.equal(created[0].locale, 'en');
  await assert.rejects(svc.createCheckout('u2', 'PRO', 'monthly'), ConflictException);
});

test('webhook rejects a bad or tampered signature', async () => {
  const { svc } = service([{ id: 'u1', email: 'a@b.ca' }]);
  const { body, header } = signed({ id: 'evt_1', type: 'ping', data: { object: {} } });
  await assert.rejects(svc.handleWebhook(body, 'v1=nope'), BadRequestException);
  const tampered = Buffer.from(body.toString().replace('evt_1', 'evt_2'));
  await assert.rejects(svc.handleWebhook(tampered, header), BadRequestException);
});

test('checkout completed stores ids and plan; replay is a no-op', async () => {
  const { svc, users } = service([{ id: 'u1', email: 'a@b.ca' }]);
  const event = {
    id: 'evt_c1',
    type: 'checkout.session.completed',
    data: { object: { mode: 'subscription', payment_status: 'paid', client_reference_id: 'u1', customer: 'cus_1', subscription: 'sub_1', metadata: { userId: 'u1', plan: 'PRO' } } },
  };
  const { body, header } = signed(event);
  assert.deepEqual(await svc.handleWebhook(body, header), { received: true });
  assert.equal(users[0].plan, 'PRO');
  assert.equal(users[0].stripeCustomerId, 'cus_1');
  assert.equal(users[0].stripeSubscriptionId, 'sub_1');
  users[0].plan = 'STARTER';
  assert.deepEqual(await svc.handleWebhook(body, header), { received: true, duplicate: true });
  assert.equal(users[0].plan, 'STARTER');
});

test('subscription updated follows the price; deleted returns to the tenant plan', async () => {
  const { svc, users } = service([{ id: 'u1', email: 'a@b.ca', plan: 'PRO', stripeCustomerId: 'cus_1', stripeSubscriptionId: 'sub_1' }]);
  const sub = (status: string, price: string) => ({
    id: 'sub_1',
    customer: 'cus_1',
    status,
    metadata: {},
    items: { data: [{ price: { id: price }, current_period_end: 1_800_000_000 }] },
  });
  let s = signed({ id: 'evt_u1', type: 'customer.subscription.updated', data: { object: sub('active', 'price_starter_y') } });
  await svc.handleWebhook(s.body, s.header);
  assert.equal(users[0].plan, 'STARTER');
  assert.equal(users[0].currentPeriodEnd?.getTime(), 1_800_000_000_000);

  s = signed({ id: 'evt_u2', type: 'customer.subscription.updated', data: { object: sub('past_due', 'price_starter_y') } });
  await svc.handleWebhook(s.body, s.header);
  assert.equal(users[0].plan, 'STARTER');
  assert.equal(users[0].subscriptionStatus, 'past_due');

  s = signed({ id: 'evt_d1', type: 'customer.subscription.deleted', data: { object: sub('canceled', 'price_starter_y') } });
  await svc.handleWebhook(s.body, s.header);
  assert.equal(users[0].plan, null);
  assert.equal(users[0].stripeSubscriptionId, null);
  assert.equal(users[0].stripeCustomerId, 'cus_1');
});

test('an unknown price or customer changes nothing but is acknowledged', async () => {
  const { svc, users, prisma } = service([{ id: 'u1', email: 'a@b.ca', plan: 'PRO', stripeSubscriptionId: 'sub_1' }]);
  let s = signed({
    id: 'evt_x1',
    type: 'customer.subscription.updated',
    data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active', metadata: {}, items: { data: [{ price: { id: 'price_other' } }] } } },
  });
  await svc.handleWebhook(s.body, s.header);
  assert.equal(users[0].plan, 'PRO');
  s = signed({ id: 'evt_x2', type: 'customer.subscription.updated', data: { object: { id: 'sub_9', customer: 'cus_9', status: 'active', metadata: {}, items: { data: [] } } } });
  assert.deepEqual(await svc.handleWebhook(s.body, s.header), { received: true, ignored: 'customer.subscription.updated' });
  assert.ok(prisma.events.has('evt_x2'));
});

test('an unpaid checkout (delayed payment) keeps the ids but grants no plan', async () => {
  const { svc, users } = service([{ id: 'u1', email: 'a@b.ca' }]);
  const { body, header } = signed({
    id: 'evt_c2',
    type: 'checkout.session.completed',
    data: { object: { mode: 'subscription', payment_status: 'unpaid', client_reference_id: 'u1', customer: 'cus_1', subscription: 'sub_1', metadata: { userId: 'u1', plan: 'PRO' } } },
  });
  await svc.handleWebhook(body, header);
  assert.equal(users[0].plan, undefined);
  assert.equal(users[0].subscriptionStatus, 'incomplete');
  assert.equal(users[0].stripeSubscriptionId, 'sub_1');
});

test('a unique clash other than the event id is not swallowed as a duplicate', async () => {
  const { svc, prisma } = service([{ id: 'u1', email: 'a@b.ca' }]);
  prisma.user.update = async () => {
    throw new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test', meta: { target: ['stripeCustomerId'] } });
  };
  const { body, header } = signed({
    id: 'evt_c3',
    type: 'checkout.session.completed',
    data: { object: { mode: 'subscription', payment_status: 'paid', client_reference_id: 'u1', customer: 'cus_1', subscription: 'sub_1', metadata: { plan: 'PRO' } } },
  });
  await assert.rejects(svc.handleWebhook(body, header), Prisma.PrismaClientKnownRequestError);
});
