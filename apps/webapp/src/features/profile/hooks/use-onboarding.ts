import { useState, useCallback, useMemo } from 'react';
import type { QuestionnaireData } from '../types/profile.types';

export type OnboardingStep = 'import' | 'questionnaire' | 'aptitude-test' | 'diagnostic' | 'choose-path';

const STEP_ORDER: OnboardingStep[] = [
  'import',
  'questionnaire',
  'aptitude-test',
  'diagnostic',
  'choose-path',
];

const STEP_LABELS: Record<OnboardingStep, string> = {
  'import': 'Import CV',
  'questionnaire': 'Questionnaire',
  'aptitude-test': 'Test d\'aptitude',
  'diagnostic': 'Diagnostic',
  'choose-path': 'Parcours',
};

interface UseOnboardingOptions {
  initialStep?: OnboardingStep;
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    options.initialStep ?? 'import',
  );
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());

  const needsAptitudeTest = useMemo(() => {
    return questionnaireData?.experienceLevel === 'none';
  }, [questionnaireData]);

  const steps = useMemo(() => {
    return STEP_ORDER.filter((step) => {
      if (step === 'aptitude-test' && !needsAptitudeTest) return false;
      return true;
    });
  }, [needsAptitudeTest]);

  const currentStepIndex = useMemo(() => {
    return steps.indexOf(currentStep);
  }, [steps, currentStep]);

  const totalSteps = steps.length;

  const progress = useMemo(() => {
    if (totalSteps <= 1) return 100;
    return Math.round((currentStepIndex / (totalSteps - 1)) * 100);
  }, [currentStepIndex, totalSteps]);

  const canGoNext = currentStepIndex < totalSteps - 1;
  const canGoBack = currentStepIndex > 0;

  const goToNext = useCallback(() => {
    if (!canGoNext) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep(steps[currentStepIndex + 1]);
  }, [canGoNext, currentStep, steps, currentStepIndex]);

  const goToBack = useCallback(() => {
    if (!canGoBack) return;
    setCurrentStep(steps[currentStepIndex - 1]);
  }, [canGoBack, steps, currentStepIndex]);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      if (steps.includes(step)) {
        setCurrentStep(step);
      }
    },
    [steps],
  );

  const markCompleted = useCallback((step: OnboardingStep) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  }, []);

  const isStepCompleted = useCallback(
    (step: OnboardingStep) => completedSteps.has(step),
    [completedSteps],
  );

  return {
    currentStep,
    currentStepIndex,
    steps,
    totalSteps,
    progress,
    canGoNext,
    canGoBack,
    goToNext,
    goToBack,
    goToStep,
    markCompleted,
    isStepCompleted,
    questionnaireData,
    setQuestionnaireData,
    needsAptitudeTest,
    stepLabels: STEP_LABELS,
  };
}
