import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { BILLING_PERIODS, PAID_PLANS, type BillingPeriod, type PaidPlan } from '../billing-config';

export class CreateCheckoutDto {
  @ApiProperty({ enum: PAID_PLANS, description: 'Personal plan to subscribe to. ENTERPRISE goes through the contact form.' })
  @IsIn(PAID_PLANS as unknown as string[])
  plan!: PaidPlan;

  @ApiProperty({ enum: BILLING_PERIODS })
  @IsIn(BILLING_PERIODS as unknown as string[])
  period!: BillingPeriod;
}
