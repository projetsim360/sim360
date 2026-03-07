import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import { ProfileType } from '@prisma/client';

export interface ProfileAdaptation {
  // PMO behavior
  pmoTone: 'patient' | 'bienveillant' | 'professionnel' | 'exigeant';
  pmoExplanationLevel: 'detailed' | 'constructive' | 'direct' | 'minimal';
  pmoProactiveInterventions: boolean;
  pmoInterventionFrequency: 'every_step' | 'regular' | 'on_demand' | 'minimal';

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
    pmoInterventionFrequency: 'minimal',
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
   * US-6.5: Get active PMI processes based on profile type.
   * Returns a list of PMI process names that should be visible/active for the learner.
   */
  getActivePmiProcesses(profileType: ProfileType | null): string[] {
    const type = profileType ?? ProfileType.BEGINNER;

    const basicProcesses = [
      'Charte de projet',
      'Registre des parties prenantes',
      'Structure de decoupage du travail (WBS)',
    ];

    const intermediateProcesses = [
      ...basicProcesses,
      'Registre des risques',
      'Echeancier du projet',
      'Budget du projet',
    ];

    const standardProcesses = [
      ...intermediateProcesses,
      'Plan de management du projet',
      'Matrice RACI',
      'Plan de communication',
      'Plan qualite',
      'Registre des changements',
      'Plan de management des risques',
      'Cahier de recette',
      'Rapport d\'avancement',
      'Bilan de phase',
    ];

    const advancedProcesses = [
      ...standardProcesses,
      'Valeur acquise (EVM)',
      'Simulation Monte Carlo',
      'Analyse quantitative des risques',
      'Tableau de bord strategique',
      'Analyse des alternatives',
      'Benchmarking',
      'Matrice de priorisation',
      'Diagramme de flux de valeur',
      'Lean Six Sigma',
      'Analyse de la capacite organisationnelle',
    ];

    switch (type) {
      case ProfileType.ZERO_EXPERIENCE:
        return basicProcesses;
      case ProfileType.BEGINNER:
        return intermediateProcesses;
      case ProfileType.RECONVERSION:
        return standardProcesses;
      case ProfileType.REINFORCEMENT:
        return advancedProcesses;
      default:
        return intermediateProcesses;
    }
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
