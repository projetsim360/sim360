import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { PlansController } from './plans.controller';
import { PlanQuotaService } from './plan-quota.service';

@Module({
  imports: [CoreModule],
  controllers: [PlansController],
  providers: [PlanQuotaService],
  exports: [PlanQuotaService],
})
export class PlansModule {}
