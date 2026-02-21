import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AuditService } from './audit.service';
import { CurrentTenant, Roles } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Query audit logs (ADMIN)' })
  query(
    @CurrentTenant() tenantId: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.query({
      tenantId,
      userId,
      action,
      entity,
      startDate,
      endDate,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get('entity/:entity/:id')
  @ApiOperation({ summary: 'Get entity history (ADMIN)' })
  getEntityHistory(@Param('entity') entity: string, @Param('id') id: string) {
    return this.auditService.getEntityHistory(entity, id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user activity (ADMIN)' })
  getUserActivity(@Param('userId') userId: string) {
    return this.auditService.getUserActivity(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit stats (ADMIN)' })
  getStats(@CurrentTenant() tenantId: string) {
    return this.auditService.getStats(tenantId);
  }
}
