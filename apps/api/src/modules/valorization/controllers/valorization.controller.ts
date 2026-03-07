import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, CurrentTenant, Auditable } from '@sim360/core';
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
}
