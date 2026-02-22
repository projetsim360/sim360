import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TenantsService } from './tenants.service';
import { CurrentTenant, Roles, Auditable } from '../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('current')
  @Roles(UserRole.MEMBER)
  @ApiOperation({ summary: 'Get current tenant' })
  getCurrent(@CurrentTenant() tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }

  @Patch('current')
  @Roles(UserRole.ADMIN)
  @Auditable('tenant.update', 'Tenant')
  @ApiOperation({ summary: 'Update current tenant' })
  updateCurrent(
    @CurrentTenant() tenantId: string,
    @Body() dto: { name?: string; logo?: string },
  ) {
    return this.tenantsService.update(tenantId, dto);
  }
}
