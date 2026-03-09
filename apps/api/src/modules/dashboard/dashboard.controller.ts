import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Roles } from '@sim360/core';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Dashboard global de l\'utilisateur' })
  getGlobalDashboard(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.dashboardService.getGlobalDashboard(userId, tenantId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Command Center — donnees enrichies du dashboard' })
  getSummary(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.dashboardService.getSummary(userId, tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques seules (leger)' })
  getStats(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.dashboardService.getStats(userId, tenantId);
  }

  @Get('trainer')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Vue formateur — tous les apprenants' })
  @ApiQuery({ name: 'scenario', required: false, description: 'Filtrer par nom de scenario' })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d'], description: 'Filtrer par periode' })
  getTrainerDashboard(
    @CurrentTenant() tenantId: string,
    @Query('scenario') scenario?: string,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getTrainerDashboard(tenantId, { scenario, period });
  }

  @Get('trainer/learners')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Liste des apprenants uniquement' })
  @ApiQuery({ name: 'scenario', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d'] })
  getTrainerLearners(
    @CurrentTenant() tenantId: string,
    @Query('scenario') scenario?: string,
    @Query('period') period?: string,
  ) {
    return this.dashboardService.getTrainerDashboard(tenantId, { scenario, period });
  }
}
