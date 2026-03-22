import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantPlan } from '@prisma/client';
import { REQUIRED_PLAN_KEY } from '../decorators/required-plan.decorator';
import { PrismaService } from '../../prisma/prisma.service';

const PLAN_HIERARCHY: Record<TenantPlan, number> = {
  FREE: 0,
  STARTER: 1,
  PRO: 2,
  ENTERPRISE: 3,
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<TenantPlan[]>(REQUIRED_PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPlans || requiredPlans.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId;
    if (!tenantId) throw new ForbiddenException('Tenant non identifie');

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { plan: true },
    });
    if (!tenant) throw new ForbiddenException('Tenant introuvable');

    const tenantLevel = PLAN_HIERARCHY[tenant.plan];
    const minLevel = Math.min(...requiredPlans.map((p) => PLAN_HIERARCHY[p]));

    if (tenantLevel < minLevel) {
      const planName = requiredPlans[0];
      throw new ForbiddenException(
        `Cette fonctionnalite necessite le plan ${planName} ou superieur. Votre plan actuel : ${tenant.plan}`,
      );
    }

    return true;
  }
}
