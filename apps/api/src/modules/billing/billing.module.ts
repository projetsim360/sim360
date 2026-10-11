import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

/** Personal subscriptions through Stripe (inactive until STRIPE_SECRET_KEY is set). */
@Module({
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
