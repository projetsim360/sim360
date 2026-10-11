import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, type TenantPlan } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '@sim360/core';
import {
  availableOffers,
  buildCheckoutParams,
  planAfterStatus,
  planForPrice,
  readBillingConfig,
  type BillingConfig,
  type BillingPeriod,
  type PaidPlan,
} from './billing-config';

/** Lets tests provide a fake Stripe client. */
export const STRIPE_CLIENT = Symbol('STRIPE_CLIENT');

/** Pinned to the API version of the installed SDK. */
const STRIPE_API_VERSION = '2026-09-30.endive';

export interface BillingStatus {
  enabled: boolean;
  offers: Array<{ plan: PaidPlan; period: BillingPeriod }>;
  plan: TenantPlan | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  canManage: boolean;
}

type WebhookResult = { received: true; duplicate?: boolean; ignored?: string };

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due', 'incomplete']);

/**
 * Personal subscriptions through Stripe Checkout (STARTER and PRO, monthly or annual, in CAD).
 * Sign-ups share one tenant, so the subscription belongs to the user: the effective plan is the
 * higher of the user's plan and the tenant plan (see PlanQuotaService). ENTERPRISE stays a
 * tenant plan sold through the contact form.
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  readonly config: BillingConfig | null;
  private client: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
    @Optional() @Inject(STRIPE_CLIENT) injectedClient?: Stripe,
  ) {
    this.config = readBillingConfig(
      (key) => configService.get<string>(key),
      configService.get<string>('app.appUrl') ?? 'http://localhost:5173',
    );
    if (injectedClient) this.client = injectedClient;
  }

  get enabled(): boolean {
    return this.config !== null;
  }

  private stripe(): Stripe {
    if (!this.config) throw new ServiceUnavailableException('Billing is not configured');
    if (!this.client) this.client = new Stripe(this.config.secretKey, { apiVersion: STRIPE_API_VERSION });
    return this.client;
  }

  async status(userId: string): Promise<BillingStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, subscriptionStatus: true, currentPeriodEnd: true, stripeCustomerId: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      enabled: this.enabled,
      offers: this.config ? availableOffers(this.config) : [],
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd,
      canManage: this.enabled && !!user.stripeCustomerId,
    };
  }

  async createCheckout(userId: string, plan: PaidPlan, period: BillingPeriod): Promise<{ url: string }> {
    const config = this.config;
    if (!config) throw new ServiceUnavailableException('Billing is not configured');
    if (!config.prices[plan][period]) throw new BadRequestException(`No price configured for ${plan} ${period}`);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, language: true, stripeCustomerId: true, stripeSubscriptionId: true, subscriptionStatus: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.stripeSubscriptionId && user.subscriptionStatus && ACTIVE_STATUSES.has(user.subscriptionStatus)) {
      throw new ConflictException('An active subscription already exists: change it from the customer portal');
    }
    const session = await this.stripe().checkout.sessions.create(
      buildCheckoutParams(config, {
        userId: user.id,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
        plan,
        period,
        locale: user.language === 'en' ? 'en' : 'fr',
      }),
    );
    if (!session.url) throw new ServiceUnavailableException('Stripe did not return a checkout URL');
    return { url: session.url };
  }

  async createPortal(userId: string): Promise<{ url: string }> {
    const config = this.config;
    if (!config) throw new ServiceUnavailableException('Billing is not configured');
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user?.stripeCustomerId) throw new BadRequestException('No billing account yet');
    const session = await this.stripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${config.appUrl}/settings#billing`,
    });
    return { url: session.url };
  }

  /** Verifies the signature on the raw body, then applies the event once. */
  async handleWebhook(rawBody: Buffer | undefined, signature: string | undefined): Promise<WebhookResult> {
    const config = this.config;
    if (!config?.webhookSecret) throw new ServiceUnavailableException('Billing webhook is not configured');
    if (!rawBody || !signature) throw new BadRequestException('Missing Stripe signature or body');
    let event: Stripe.Event;
    try {
      event = this.stripe().webhooks.constructEvent(rawBody, signature, config.webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe signature');
    }
    return this.applyEvent(event, config);
  }

  async applyEvent(event: Stripe.Event, config: BillingConfig): Promise<WebhookResult> {
    const change = await this.changeFor(event, config);
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.billingEvent.create({ data: { stripeEventId: event.id, type: event.type, userId: change?.userId ?? null } });
        if (change) await tx.user.update({ where: { id: change.userId }, data: change.data });
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return { received: true, duplicate: true };
      }
      throw err;
    }
    if (event.type === 'invoice.payment_failed') {
      this.logger.warn(`Payment failed for ${change?.userId ?? 'unknown user'} (event ${event.id})`);
    }
    return change ? { received: true } : { received: true, ignored: event.type };
  }

  /** The user row update an event implies, or null when the event changes nothing here. */
  private async changeFor(
    event: Stripe.Event,
    config: BillingConfig,
  ): Promise<{ userId: string; data: Prisma.UserUpdateInput } | null> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') return null;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        if (!userId || !(await this.userExists(userId))) return null;
        const plan = session.metadata?.plan === 'PRO' || session.metadata?.plan === 'STARTER' ? session.metadata.plan : undefined;
        return {
          userId,
          data: {
            stripeCustomerId: idOf(session.customer),
            stripeSubscriptionId: idOf(session.subscription),
            subscriptionStatus: 'active',
            ...(plan ? { plan } : {}),
          },
        };
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = await this.userForSubscription(sub);
        if (!userId) return null;
        const item = sub.items?.data?.[0];
        const deleted = event.type === 'customer.subscription.deleted';
        const status = deleted ? 'canceled' : sub.status;
        const plan = planAfterStatus(status, planForPrice(config, item?.price?.id));
        return {
          userId,
          data: {
            stripeCustomerId: idOf(sub.customer),
            stripeSubscriptionId: deleted ? null : sub.id,
            subscriptionStatus: status,
            currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
            ...(plan !== undefined ? { plan } : {}),
          },
        };
      }
      case 'invoice.payment_failed': {
        const customerId = idOf(event.data.object.customer);
        if (!customerId) return null;
        const user = await this.prisma.user.findUnique({ where: { stripeCustomerId: customerId }, select: { id: true } });
        return user ? { userId: user.id, data: { subscriptionStatus: 'past_due' } } : null;
      }
      default:
        return null;
    }
  }

  private async userExists(id: string): Promise<boolean> {
    return !!(await this.prisma.user.findUnique({ where: { id }, select: { id: true } }));
  }

  /** metadata.userId first (set at checkout), then the stored subscription or customer id. */
  private async userForSubscription(sub: Stripe.Subscription): Promise<string | null> {
    const fromMetadata = sub.metadata?.userId;
    if (fromMetadata && (await this.userExists(fromMetadata))) return fromMetadata;
    const bySub = await this.prisma.user.findUnique({ where: { stripeSubscriptionId: sub.id }, select: { id: true } });
    if (bySub) return bySub.id;
    const customerId = idOf(sub.customer);
    if (!customerId) return null;
    const byCustomer = await this.prisma.user.findUnique({ where: { stripeCustomerId: customerId }, select: { id: true } });
    return byCustomer?.id ?? null;
  }
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}
