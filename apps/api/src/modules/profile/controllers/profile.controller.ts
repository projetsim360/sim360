import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  CurrentTenant,
  Auditable,
} from '@sim360/core';
import { ProfileService } from '../services/profile.service';
import { ProfileAnalysisService } from '../services/profile-analysis.service';
import { ProfileConfigService } from '../services/profile-config.service';
import {
  UploadCvDto,
  SubmitQuestionnaireDto,
  SubmitAptitudeTestDto,
  CustomizeSkillsDto,
  SelectSectorDto,
  SubmitCustomProjectDto,
} from '../dto';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly profileAnalysisService: ProfileAnalysisService,
    private readonly profileConfigService: ProfileConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur courant (crée un profil vide si inexistant)' })
  getProfile(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.profileService.getOrCreateProfile(user.id, tenantId);
  }

  @Get('adaptation')
  @ApiOperation({
    summary: 'Obtenir la configuration d\'adaptation basée sur le profileType de l\'utilisateur',
    description: 'Retourne les paramètres d\'adaptation (ton PMO, nombre de révisions, tooltips, etc.) en fonction du profil de l\'apprenant.',
  })
  getAdaptation(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.profileConfigService.getAdaptationForUser(user.id, tenantId);
  }

  @Post('upload-cv')
  @Auditable('PROFILE_CV_UPLOAD', 'UserProfile')
  @ApiOperation({ summary: 'Uploader un CV (URL du fichier déjà stocké)' })
  uploadCv(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: UploadCvDto,
  ) {
    return this.profileService.uploadCv(user.id, tenantId, dto);
  }

  @Post('import-linkedin')
  @Auditable('PROFILE_LINKEDIN_IMPORT', 'UserProfile')
  @ApiOperation({ summary: 'Importer les données LinkedIn' })
  importLinkedin(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() linkedinData: Record<string, unknown>,
  ) {
    return this.profileService.importLinkedin(user.id, tenantId, linkedinData);
  }

  @Post('questionnaire')
  @Auditable('PROFILE_QUESTIONNAIRE_SUBMIT', 'UserProfile')
  @ApiOperation({ summary: 'Soumettre les réponses au questionnaire de profiling' })
  submitQuestionnaire(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: SubmitQuestionnaireDto,
  ) {
    return this.profileService.submitQuestionnaire(user.id, tenantId, dto);
  }

  @Post('aptitude-test')
  @Auditable('PROFILE_APTITUDE_TEST_SUBMIT', 'UserProfile')
  @ApiOperation({ summary: 'Soumettre les réponses au test d\'aptitude (évaluation IA)' })
  submitAptitudeTest(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: SubmitAptitudeTestDto,
  ) {
    return this.profileAnalysisService.submitAptitudeTest(user.id, tenantId, dto);
  }

  @Post('analyze')
  @Auditable('PROFILE_ANALYZE', 'UserProfile')
  @ApiOperation({ summary: 'Déclencher l\'analyse IA de gap (diagnostic, profileType, compétences)' })
  analyze(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.profileAnalysisService.analyze(user.id, tenantId);
  }

  @Put('skills')
  @Auditable('PROFILE_SKILLS_CUSTOMIZE', 'UserProfile')
  @ApiOperation({ summary: 'Personnaliser les compétences après diagnostic' })
  customizeSkills(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: CustomizeSkillsDto,
  ) {
    return this.profileService.customizeSkills(user.id, tenantId, dto);
  }

  @Put('sector')
  @Auditable('PROFILE_SECTOR_SELECT', 'UserProfile')
  @ApiOperation({ summary: 'Sélectionner le secteur (accepter la suggestion ou choisir un autre)' })
  selectSector(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: SelectSectorDto,
  ) {
    return this.profileService.selectSector(user.id, tenantId, dto);
  }

  @Post('custom-project')
  @Auditable('PROFILE_CUSTOM_PROJECT_SUBMIT', 'UserProfile')
  @ApiOperation({ summary: 'Soumettre un projet personnalisé pour génération de scénario IA' })
  submitCustomProject(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: SubmitCustomProjectDto,
  ) {
    return this.profileService.submitCustomProject(user.id, tenantId, dto);
  }

  @Post('complete')
  @Auditable('PROFILE_ONBOARDING_COMPLETE', 'UserProfile')
  @ApiOperation({ summary: 'Marquer l\'onboarding comme terminé' })
  completeOnboarding(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.profileService.completeOnboarding(user.id, tenantId);
  }
}
