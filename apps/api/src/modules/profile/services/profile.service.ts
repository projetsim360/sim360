import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  PrismaService,
  EventPublisherService,
  EventType,
  AggregateType,
} from '@sim360/core';
import {
  UploadCvDto,
  SubmitQuestionnaireDto,
  CustomizeSkillsDto,
  SelectSectorDto,
  SubmitCustomProjectDto,
} from '../dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Get the current user's profile, or create an empty one if it doesn't exist.
   */
  async getOrCreateProfile(userId: string, tenantId: string) {
    let profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (profile && profile.tenantId !== tenantId) {
      throw new NotFoundException('Profil introuvable');
    }

    if (!profile) {
      profile = await this.prisma.userProfile.create({
        data: {
          userId,
          tenantId,
          onboardingStep: 'not_started',
        },
      });
    }

    return profile;
  }

  /**
   * Upload CV: store fileUrl and mark the onboarding step.
   */
  async uploadCv(userId: string, tenantId: string, dto: UploadCvDto) {
    const profile = await this.getOrCreateProfile(userId, tenantId);

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        cvFileUrl: dto.fileUrl,
        onboardingStep: 'cv_uploaded',
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_CV_UPLOADED,
        AggregateType.USER_PROFILE,
        profile.id,
        { fileUrl: dto.fileUrl },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * Import LinkedIn data.
   */
  async importLinkedin(userId: string, tenantId: string, linkedinData: Record<string, unknown>) {
    const profile = await this.getOrCreateProfile(userId, tenantId);

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        linkedinData: linkedinData as any,
        onboardingStep: 'linkedin_imported',
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_LINKEDIN_IMPORTED,
        AggregateType.USER_PROFILE,
        profile.id,
        { hasLinkedinData: true },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * Submit questionnaire answers.
   */
  async submitQuestionnaire(
    userId: string,
    tenantId: string,
    dto: SubmitQuestionnaireDto,
  ) {
    const profile = await this.getOrCreateProfile(userId, tenantId);

    const questionnaireData = {
      objective: dto.objective,
      targetDomain: dto.targetDomain,
      experienceLevel: dto.experienceLevel,
      mainMotivation: dto.mainMotivation,
      additionalInfo: dto.additionalInfo,
    };

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        questionnaireData: questionnaireData as any,
        onboardingStep: 'questionnaire_completed',
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_QUESTIONNAIRE_COMPLETED,
        AggregateType.USER_PROFILE,
        profile.id,
        { experienceLevel: dto.experienceLevel },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * Customize skills after diagnostic.
   */
  async customizeSkills(
    userId: string,
    tenantId: string,
    dto: CustomizeSkillsDto,
  ) {
    const profile = await this.getOrCreateProfile(userId, tenantId);

    if (!profile.diagnosticData) {
      throw new BadRequestException(
        'Le diagnostic doit etre genere avant de personnaliser les competences',
      );
    }

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        skills: dto.skills as any,
        onboardingStep: 'skills_customized',
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_SKILLS_CUSTOMIZED,
        AggregateType.USER_PROFILE,
        profile.id,
        { skillCount: dto.skills.length },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * Select sector (accept suggestion or override).
   */
  async selectSector(
    userId: string,
    tenantId: string,
    dto: SelectSectorDto,
  ) {
    const profile = await this.getOrCreateProfile(userId, tenantId);

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        selectedSector: dto.sector,
        onboardingStep: 'sector_selected',
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_SECTOR_SELECTED,
        AggregateType.USER_PROFILE,
        profile.id,
        {
          selectedSector: dto.sector,
          suggestedSector: profile.suggestedSector,
          isOverride: dto.sector !== profile.suggestedSector,
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * Submit a custom project for AI scenario generation.
   */
  async submitCustomProject(
    userId: string,
    tenantId: string,
    dto: SubmitCustomProjectDto,
  ) {
    const profile = await this.getOrCreateProfile(userId, tenantId);

    const customProjectData = {
      projectName: dto.projectName,
      description: dto.description,
      sector: dto.sector,
      constraints: dto.constraints,
      learningObjectives: dto.learningObjectives,
    };

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        customProjectData: customProjectData as any,
        onboardingStep: 'custom_project_submitted',
      },
    });

    return updated;
  }

  /**
   * Mark onboarding as completed.
   */
  async completeOnboarding(userId: string, tenantId: string) {
    const profile = await this.getOrCreateProfile(userId, tenantId);

    if (!profile.profileType) {
      throw new BadRequestException(
        'Le diagnostic doit etre genere avant de completer l\'onboarding',
      );
    }

    if (!profile.selectedSector) {
      throw new BadRequestException(
        'Un secteur doit etre selectionne avant de completer l\'onboarding',
      );
    }

    const updated = await this.prisma.userProfile.update({
      where: { id: profile.id },
      data: {
        onboardingStep: 'completed',
        completedAt: new Date(),
      },
    });

    this.eventPublisher
      .publish(
        EventType.PROFILE_ONBOARDING_COMPLETED,
        AggregateType.USER_PROFILE,
        profile.id,
        {
          profileType: profile.profileType,
          selectedSector: profile.selectedSector,
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 2,
        },
      )
      .catch(() => {});

    return updated;
  }
}
