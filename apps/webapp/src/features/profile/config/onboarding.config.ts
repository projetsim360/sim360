import type { QuestionnaireData } from '../types/profile.types';

export type OnboardingStep = 'profil' | 'aptitude-test' | 'diagnostic' | 'choose-path';

export const STEP_ORDER: OnboardingStep[] = ['profil', 'aptitude-test', 'diagnostic', 'choose-path'];

export interface StepMeta {
  shortLabel: string;
  railSubtitle: string;
  title: string;
  lead: string;
  icon: string;
}

export const STEP_META: Record<OnboardingStep, StepMeta> = {
  'profil': {
    shortLabel: 'Profil',
    railSubtitle: 'Import + questionnaire',
    title: 'Parlez-nous de vous',
    lead: "Quelques informations pour personnaliser votre simulation. Importez votre CV pour gagner du temps, ou répondez directement.",
    icon: 'profile-circle',
  },
  'aptitude-test': {
    shortLabel: 'Mise en situation',
    railSubtitle: '3 scénarios',
    title: 'Mise en situation',
    lead: "Trois situations concrètes de gestion de projet. Il n'y a pas de mauvaise réponse.",
    icon: 'notepad',
  },
  'diagnostic': {
    shortLabel: 'Diagnostic',
    railSubtitle: 'Analyse de profil',
    title: 'Votre diagnostic',
    lead: "Voici ce que nous avons compris de votre profil.",
    icon: 'shield-tick',
  },
  'choose-path': {
    shortLabel: 'Parcours',
    railSubtitle: 'Secteur + lancement',
    title: 'Choisissez votre parcours',
    lead: "Le secteur dans lequel vous allez piloter votre première simulation.",
    icon: 'route',
  },
};

export interface OnboardingLiveState {
  questionnaire?: Partial<QuestionnaireData>;
  aptitudeProgress?: { current: number; total: number; answeredCategories: string[] };
}

export interface StepperItem {
  key: OnboardingStep;
  shortLabel: string;
  railSubtitle: string;
  isConditional: boolean;
  isActive: boolean;
  displayNumber: number | null;
  isCurrent: boolean;
  isCompleted: boolean;
}
