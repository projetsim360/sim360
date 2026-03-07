import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import { ProfileType } from '@prisma/client';

export interface ProfileAdaptation {
  // PMO behavior
  pmoTone: 'patient' | 'bienveillant' | 'professionnel' | 'exigeant';
  pmoExplanationLevel: 'detailed' | 'constructive' | 'direct' | 'minimal';
  pmoProactiveInterventions: boolean;
  pmoInterventionFrequency: 'every_step' | 'regular' | 'on_demand' | 'silent';

  // Deliverables
  maxRevisions: number;

  // PMI processes
  activePmiProcessCount: { min: number; max: number };

  // Decision rollbacks
  maxRollbacks: number;

  // Meeting AI behavior
  pedagogicQuestions: boolean;

  // Glossary tooltips
  showGlossaryTooltips: boolean;
}

const ADAPTATION_MAP: Record<ProfileType, ProfileAdaptation> = {
  [ProfileType.ZERO_EXPERIENCE]: {
    pmoTone: 'patient',
    pmoExplanationLevel: 'detailed',
    pmoProactiveInterventions: true,
    pmoInterventionFrequency: 'every_step',
    maxRevisions: 5,
    activePmiProcessCount: { min: 8, max: 10 },
    maxRollbacks: 3,
    pedagogicQuestions: true,
    showGlossaryTooltips: true,
  },
  [ProfileType.BEGINNER]: {
    pmoTone: 'bienveillant',
    pmoExplanationLevel: 'constructive',
    pmoProactiveInterventions: true,
    pmoInterventionFrequency: 'regular',
    maxRevisions: 3,
    activePmiProcessCount: { min: 12, max: 15 },
    maxRollbacks: 1,
    pedagogicQuestions: true,
    showGlossaryTooltips: true,
  },
  [ProfileType.RECONVERSION]: {
    pmoTone: 'professionnel',
    pmoExplanationLevel: 'direct',
    pmoProactiveInterventions: false,
    pmoInterventionFrequency: 'on_demand',
    maxRevisions: 2,
    activePmiProcessCount: { min: 15, max: 20 },
    maxRollbacks: 0,
    pedagogicQuestions: false,
    showGlossaryTooltips: false,
  },
  [ProfileType.REINFORCEMENT]: {
    pmoTone: 'exigeant',
    pmoExplanationLevel: 'minimal',
    pmoProactiveInterventions: false,
    pmoInterventionFrequency: 'silent',
    maxRevisions: 1,
    activePmiProcessCount: { min: 20, max: 25 },
    maxRollbacks: 0,
    pedagogicQuestions: false,
    showGlossaryTooltips: false,
  },
};

@Injectable()
export class ProfileConfigService {
  private readonly logger = new Logger(ProfileConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the adaptation configuration for a given profileType.
   * Defaults to BEGINNER if profileType is null.
   */
  getAdaptation(profileType: ProfileType | null): ProfileAdaptation {
    const type = profileType ?? ProfileType.BEGINNER;
    return ADAPTATION_MAP[type];
  }

  /**
   * Fetch the user's profile and return the corresponding adaptation.
   */
  async getAdaptationForUser(
    userId: string,
    tenantId: string,
  ): Promise<ProfileAdaptation> {
    const profile = await this.prisma.userProfile.findFirst({
      where: { userId, tenantId },
      select: { profileType: true },
    });

    if (!profile) {
      this.logger.debug(
        `No profile found for user ${userId}, defaulting to BEGINNER adaptation`,
      );
      return this.getAdaptation(null);
    }

    return this.getAdaptation(profile.profileType);
  }
}
