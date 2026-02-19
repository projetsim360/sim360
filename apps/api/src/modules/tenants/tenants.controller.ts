import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CurrentTenant } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant' })
  getCurrent(@CurrentTenant() tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }

  @Patch('current')
  @ApiOperation({ summary: 'Update current tenant' })
  updateCurrent(
    @CurrentTenant() tenantId: string,
    @Body() dto: { name?: string; logo?: string },
  ) {
    return this.tenantsService.update(tenantId, dto);
  }
}
