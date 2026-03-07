import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Public, Auditable } from '@sim360/core';
import { RecruitmentService } from './services/recruitment.service';
import { RecruitmentJoinService } from './services/recruitment-join.service';

@ApiTags('Recruitment - Candidat')
@Controller('recruitment/join')
export class RecruitmentPublicController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly joinService: RecruitmentJoinService,
  ) {}

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Voir les informations publiques d\'une campagne' })
  getCampaignPublicInfo(@Param('slug') slug: string) {
    return this.recruitmentService.findBySlug(slug);
  }

  @Post(':slug/start')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Auditable('recruitment.candidate.join', 'CandidateResult')
  @ApiOperation({ summary: 'Rejoindre une campagne et demarrer la simulation' })
  joinCampaign(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.joinService.joinCampaign(slug, userId, tenantId);
  }
}
