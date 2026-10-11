import type { QuestionnaireData } from '../types/profile.types';
import type { AppMessageKey } from '@/i18n/app/messages';

export type OnboardingStep = 'profil' | 'aptitude-test' | 'diagnostic' | 'choose-path';

export const STEP_ORDER: OnboardingStep[] = ['profil', 'aptitude-test', 'diagnostic', 'choose-path'];

export interface StepMeta {
  shortLabel: AppMessageKey;
  railSubtitle: AppMessageKey;
  title: AppMessageKey;
  lead: AppMessageKey;
  icon: string;
}

export const STEP_META: Record<OnboardingStep, StepMeta> = {
  'profil': {
    shortLabel: 'onboarding.step.profil.short',
    railSubtitle: 'onboarding.step.profil.rail',
    title: 'onboarding.step.profil.title',
    lead: 'onboarding.step.profil.lead',
    icon: 'profile-circle',
  },
  'aptitude-test': {
    shortLabel: 'onboarding.step.aptitude.short',
    railSubtitle: 'onboarding.step.aptitude.rail',
    title: 'onboarding.step.aptitude.title',
    lead: 'onboarding.step.aptitude.lead',
    icon: 'notepad',
  },
  'diagnostic': {
    shortLabel: 'onboarding.step.diagnostic.short',
    railSubtitle: 'onboarding.step.diagnostic.rail',
    title: 'onboarding.step.diagnostic.title',
    lead: 'onboarding.step.diagnostic.lead',
    icon: 'shield-tick',
  },
  'choose-path': {
    shortLabel: 'onboarding.step.path.short',
    railSubtitle: 'onboarding.step.path.rail',
    title: 'onboarding.step.path.title',
    lead: 'onboarding.step.path.lead',
    icon: 'route',
  },
};

export interface OnboardingLiveState {
  questionnaire?: Partial<QuestionnaireData>;
  aptitudeProgress?: { current: number; total: number; answeredCategories: string[] };
}

export interface StepperItem {
  key: OnboardingStep;
  shortLabel: AppMessageKey;
  railSubtitle: AppMessageKey;
  isConditional: boolean;
  isActive: boolean;
  displayNumber: number | null;
  isCurrent: boolean;
  isCompleted: boolean;
}
