import { Body, Controller, Get, Headers, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Auditable, CurrentUser, JwtAuthGuard, Public } from '@sim360/core';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Whether billing is on, the offers, and the current user subscription' })
  status(@CurrentUser() user: { id: string }) {
    return this.billing.status(user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @Auditable('BILLING_CHECKOUT_STARTED', 'User')
  @ApiOperation({ summary: 'Create a Stripe Checkout session for a personal plan (CAD)' })
  checkout(@CurrentUser() user: { id: string }, @Body() dto: CreateCheckoutDto) {
    return this.billing.createCheckout(user.id, dto.plan, dto.period);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  @Auditable('BILLING_PORTAL_OPENED', 'User')
  @ApiOperation({ summary: 'Open the Stripe customer portal (payment method, invoices, plan change, cancel)' })
  portal(@CurrentUser() user: { id: string }) {
    return this.billing.createPortal(user.id);
  }

  /** Stripe calls this endpoint; the signature is checked against the raw body. */
  @Post('webhook')
  @Public()
  @SkipThrottle()
  @HttpCode(200)
  @ApiExcludeEndpoint()
  webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature?: string) {
    return this.billing.handleWebhook(req.rawBody, signature);
  }
}
