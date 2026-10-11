import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TenantPlan } from '@prisma/client';
import { PrismaService } from '@sim360/core';
import {
  PLAN_LABEL,
  PLAN_LIMITS,
  includesPlan,
  monthlyLimit,
  remaining,
  startOfMonth,
  type MeetingMode,
} from './plan-limits';

/** Error code prefix the webapp can match to show an upgrade prompt. */
export const PLAN_QUOTA_ERROR = 'PLAN_QUOTA_EXCEEDED';

export interface PlanUsage {
  plan: TenantPlan;
  planLabel: string;
  enforced: boolean;
  periodStart: string;
  textMeetings: { used: number; limit: number | null; remaining: number | null };
  voiceMeetings: { used: number; limit: number | null; remaining: number | null };
  customMeetings: boolean;
}

/**
 * Applies the pricing-grid quotas. Enforcement is off unless PLAN_QUOTAS_ENFORCED=true, so the
 * pilot keeps its "full access" promise; usage is always computed and exposed.
 */
@Injectable()
export class PlanQuotaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  get enforced(): boolean {
    return this.config.get<string>('PLAN_QUOTAS_ENFORCED') === 'true';
  }

  async usage(tenantId: string, userId: string, now = new Date()): Promise<PlanUsage> {
    const plan = await this.planOf(tenantId);
    const since = startOfMonth(now);
    const [text, voice] = await Promise.all([
      this.countStarted(tenantId, userId, 'TEXT', since),
      this.countStarted(tenantId, userId, 'AUDIO', since),
    ]);
    const textLimit = monthlyLimit(plan, 'TEXT');
    const voiceLimit = monthlyLimit(plan, 'AUDIO');
    return {
      plan,
      planLabel: PLAN_LABEL[plan],
      enforced: this.enforced,
      periodStart: since.toISOString(),
      textMeetings: { used: text, limit: textLimit, remaining: remaining(textLimit, text) },
      voiceMeetings: { used: voice, limit: voiceLimit, remaining: remaining(voiceLimit, voice) },
      customMeetings: PLAN_LIMITS[plan].customMeetings,
    };
  }

  /** Before a meeting moves to IN_PROGRESS (or switches to voice). */
  async assertCanStartMeeting(tenantId: string, userId: string, mode: MeetingMode, now = new Date()) {
    if (!this.enforced) return;
    const plan = await this.planOf(tenantId);
    const limit = monthlyLimit(plan, mode);
    if (limit === null) return;
    const kind = mode === 'AUDIO' ? 'vocales' : 'écrites';
    if (limit === 0) {
      throw this.denied(`Les réunions ${kind} ne sont pas incluses dans le plan ${PLAN_LABEL[plan]}.`);
    }
    const used = await this.countStarted(tenantId, userId, mode, startOfMonth(now));
    if (used >= limit) {
      throw this.denied(
        `Vous avez utilisé vos ${limit} réunions ${kind} du mois (plan ${PLAN_LABEL[plan]}). Le compteur repart le 1er du mois.`,
      );
    }
  }

  /** Before a simulation is created from a scenario. */
  async assertCanUseScenario(tenantId: string, requiredPlan: TenantPlan) {
    if (!this.enforced) return;
    const plan = await this.planOf(tenantId);
    if (!includesPlan(plan, requiredPlan)) {
      throw this.denied(
        `Ce scénario fait partie du plan ${PLAN_LABEL[requiredPlan]}. Votre plan actuel : ${PLAN_LABEL[plan]}.`,
      );
    }
  }

  /** Before a learner plans a custom meeting. */
  async assertCanCreateCustomMeeting(tenantId: string) {
    if (!this.enforced) return;
    const plan = await this.planOf(tenantId);
    if (!PLAN_LIMITS[plan].customMeetings) {
      throw this.denied(`Les réunions personnalisées font partie du plan ${PLAN_LABEL.PRO}.`);
    }
  }

  private denied(message: string) {
    return new ForbiddenException(`${PLAN_QUOTA_ERROR}:${message}`);
  }

  private async planOf(tenantId: string): Promise<TenantPlan> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { plan: true } });
    if (!tenant) throw new NotFoundException('Tenant introuvable');
    return tenant.plan;
  }

  private countStarted(tenantId: string, userId: string, mode: MeetingMode, since: Date) {
    return this.prisma.meeting.count({
      where: {
        mode,
        startedAt: { gte: since },
        simulation: { tenantId, userId },
      },
    });
  }
}
