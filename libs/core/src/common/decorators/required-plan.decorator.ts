import { SetMetadata } from '@nestjs/common';
import { TenantPlan } from '@prisma/client';

export const REQUIRED_PLAN_KEY = 'required_plan';
export const RequiredPlan = (...plans: TenantPlan[]) => SetMetadata(REQUIRED_PLAN_KEY, plans);
