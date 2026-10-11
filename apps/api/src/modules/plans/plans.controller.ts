import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser, JwtAuthGuard } from '@sim360/core';
import { PlanQuotaService } from './plan-quota.service';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly quotas: PlanQuotaService) {}

  @Get('usage')
  @ApiOperation({ summary: 'Plan, quotas et consommation du mois pour l’utilisateur courant' })
  usage(@CurrentUser() user: { id: string }, @CurrentTenant() tenantId: string) {
    return this.quotas.usage(tenantId, user.id);
  }
}
