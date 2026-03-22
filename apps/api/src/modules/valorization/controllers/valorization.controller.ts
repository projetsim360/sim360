import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, CurrentTenant, Auditable, RequiredPlan, PlanGuard } from '@sim360/core';
import { TenantPlan } from '@prisma/client';
import { Response } from 'express';
import { DebriefingService } from '../services/debriefing.service';
import { PortfolioService } from '../services/portfolio.service';
import { CvSuggestionService } from '../services/cv-suggestion.service';

@ApiTags('Valorization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ValorizationController {
  constructor(
    private readonly debriefingService: DebriefingService,
    private readonly portfolioService: PortfolioService,
    private readonly cvSuggestionService: CvSuggestionService,
  ) {}

  @Get('simulations/:simId/debriefing')
  @Auditable('DEBRIEFING_VIEW', 'CompetencyBadge')
  @ApiOperation({ summary: 'Obtenir ou generer le debriefing d\'une simulation' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiQuery({ name: 'force', required: false, description: 'Forcer la regeneration (true/false)' })
  getDebriefing(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Query('force') force?: string,
  ) {
    return this.debriefingService.getOrGenerateDebriefing(
      simId,
      user.id,
      tenantId,
      force === 'true',
    );
  }

  @Get('simulations/:simId/portfolio')
  @Auditable('PORTFOLIO_VIEW', 'CompetencyBadge')
  @ApiOperation({ summary: 'Obtenir les donnees du portfolio d\'une simulation' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  getPortfolio(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.portfolioService.getPortfolio(simId, user.id, tenantId);
  }

  @Get('simulations/:simId/cv-suggestions')
  @Auditable('CV_SUGGESTIONS_VIEW', 'CompetencyBadge')
  @ApiOperation({ summary: 'Obtenir ou generer les suggestions CV d\'une simulation' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  getCvSuggestions(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.cvSuggestionService.getOrGenerateSuggestions(simId, user.id, tenantId);
  }

  @Get('simulations/:simId/portfolio/export/pdf')
  @RequiredPlan(TenantPlan.STARTER)
  @UseGuards(PlanGuard)
  @Auditable('PORTFOLIO_EXPORT_PDF', 'CompetencyBadge')
  @ApiOperation({ summary: 'Exporter le portfolio en PDF (plan STARTER+)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  async exportPortfolioPdf(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.portfolioService.exportPdf(
      simId,
      user.id,
      tenantId,
    );
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('simulations/:simId/portfolio/export/zip')
  @RequiredPlan(TenantPlan.PRO)
  @UseGuards(PlanGuard)
  @Auditable('PORTFOLIO_EXPORT_ZIP', 'CompetencyBadge')
  @ApiOperation({ summary: 'Exporter le portfolio en ZIP (plan PRO+)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  async exportPortfolioZip(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.portfolioService.exportZip(
      simId,
      user.id,
      tenantId,
    );
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('simulations/:simId/portfolio/best')
  @ApiOperation({ summary: 'Obtenir les meilleurs livrables filtres par score' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiQuery({ name: 'minScore', required: false, description: 'Score minimum (defaut: 70)' })
  getBestDeliverables(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Query('minScore') minScore?: string,
  ) {
    return this.portfolioService.getBestDeliverables(
      simId,
      user.id,
      tenantId,
      minScore ? parseInt(minScore, 10) : 70,
    );
  }
}
