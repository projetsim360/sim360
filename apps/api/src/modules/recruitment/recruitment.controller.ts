import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Roles, Auditable } from '@sim360/core';
import { UserRole } from '@prisma/client';
import { RecruitmentService } from './services/recruitment.service';
import { RecruitmentScenarioService } from './services/recruitment-scenario.service';
import { CandidateReportService } from './services/candidate-report.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  QueryCampaignsDto,
  GenerateShortlistDto,
  CompareCandidatesDto,
} from './dto';

@ApiTags('Recruitment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recruitment/campaigns')
export class RecruitmentController {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly scenarioService: RecruitmentScenarioService,
    private readonly reportService: CandidateReportService,
  ) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.campaign.create', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Creer une campagne de recrutement' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.recruitmentService.create(tenantId, userId, dto);
  }

  @Get()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lister mes campagnes de recrutement' })
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryCampaignsDto,
  ) {
    return this.recruitmentService.findAll(tenantId, userId, query);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Detail d\'une campagne' })
  findOne(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.recruitmentService.findOne(id, tenantId);
  }

  @Put(':id')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.campaign.update', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Modifier une campagne (brouillon uniquement)' })
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.recruitmentService.update(id, tenantId, dto);
  }

  @Post(':id/generate-scenario')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.scenario.generate', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Generer le scenario IA pour la campagne' })
  generateScenario(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.scenarioService.generateScenarioForCampaign(id, tenantId, userId);
  }

  @Post(':id/publish')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.campaign.publish', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Publier la campagne (active le lien candidat)' })
  publish(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recruitmentService.publish(id, tenantId, userId);
  }

  @Post(':id/close')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.campaign.close', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Fermer la campagne' })
  close(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recruitmentService.close(id, tenantId, userId);
  }

  @Post(':id/archive')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.campaign.archive', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Archiver la campagne' })
  archive(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recruitmentService.archive(id, tenantId, userId);
  }

  @Get(':id/candidates')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lister les candidats d\'une campagne' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  listCandidates(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.recruitmentService.listCandidates(id, tenantId, page ? +page : 1, limit ? +limit : 20);
  }

  @Get(':id/candidates/:candidateId')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rapport 360 d\'un candidat' })
  getCandidateReport(
    @Param('id') campaignId: string,
    @Param('candidateId') candidateId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.recruitmentService.getCandidateReport(campaignId, candidateId, tenantId);
  }

  @Post(':id/candidates/:candidateId/generate-report')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.report.generate', 'CandidateResult')
  @ApiOperation({ summary: 'Generer le rapport 360 d\'un candidat via IA' })
  generateReport360(
    @Param('id') _campaignId: string,
    @Param('candidateId') candidateId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportService.generateReport360(candidateId, tenantId, userId);
  }

  @Get(':id/shortlist')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.shortlist.generate', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Generer la short-list des meilleurs candidats' })
  generateShortlist(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query() query: GenerateShortlistDto,
  ) {
    return this.reportService.generateShortlist(id, tenantId, userId, query.count ?? 10);
  }

  @Post(':id/compare')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.candidates.compare', 'RecruitmentCampaign')
  @ApiOperation({ summary: 'Comparer deux candidats' })
  compareCandidates(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CompareCandidatesDto,
  ) {
    return this.reportService.compareCandidates(id, dto.candidateIds[0], dto.candidateIds[1], tenantId, userId);
  }

  @Get(':id/candidates/:candidateId/interview-guide')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('recruitment.interview-guide.generate', 'CandidateResult')
  @ApiOperation({ summary: 'Generer un guide d\'entretien personnalise' })
  generateInterviewGuide(
    @Param('id') _campaignId: string,
    @Param('candidateId') candidateId: string,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportService.generateInterviewGuide(candidateId, tenantId, userId);
  }

  @Get(':id/dashboard')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Dashboard temps reel de la campagne' })
  getDashboard(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.recruitmentService.getDashboard(id, tenantId);
  }
}
