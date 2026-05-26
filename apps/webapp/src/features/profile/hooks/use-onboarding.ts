import { useState, useCallback, useMemo } from 'react';
import type { QuestionnaireData } from '../types/profile.types';
import { STEP_ORDER, STEP_META } from '../config/onboarding.config';
import type { OnboardingStep, StepperItem } from '../config/onboarding.config';

export type { OnboardingStep } from '../config/onboarding.config';

interface UseOnboardingOptions {
  initialStep?: OnboardingStep;
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(options.initialStep ?? 'profil');
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());

  const needsAptitudeTest = useMemo(
    () => questionnaireData?.experienceLevel === 'none',
    [questionnaireData],
  );

  const steps = useMemo(
    () => STEP_ORDER.filter((s) => s !== 'aptitude-test' || needsAptitudeTest),
    [needsAptitudeTest],
  );

  const currentStepIndex = useMemo(() => steps.indexOf(currentStep), [steps, currentStep]);
  const totalSteps = steps.length;
  const currentNumber = currentStepIndex + 1;

  const goToNext = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) return;
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep(steps[currentStepIndex + 1]);
  }, [currentStep, steps, currentStepIndex]);

  const goToBack = useCallback(() => {
    if (currentStepIndex <= 0) return;
    setCurrentStep(steps[currentStepIndex - 1]);
  }, [steps, currentStepIndex]);

  const goToStep = useCallback(
    (step: OnboardingStep) => {
      if (steps.includes(step)) setCurrentStep(step);
    },
    [steps],
  );

  const markCompleted = useCallback((step: OnboardingStep) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  }, []);

  // Submitting the Profil step decides whether the conditional aptitude step
  // exists. We must advance using the *fresh* experience level rather than the
  // current `steps` closure, which is still derived from the previous (null)
  // questionnaire and would skip the aptitude step for beginners.
  const completeProfilStep = useCallback((data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setCompletedSteps((prev) => new Set(prev).add('profil'));
    const needsApt = data.experienceLevel === 'none';
    const freshSteps = STEP_ORDER.filter((s) => s !== 'aptitude-test' || needsApt);
    const next = freshSteps[freshSteps.indexOf('profil') + 1];
    if (next) setCurrentStep(next);
  }, []);

  const stepperItems: StepperItem[] = useMemo(
    () =>
      STEP_ORDER.map((key) => {
        const isActive = steps.includes(key);
        const activeIdx = steps.indexOf(key);
        return {
          key,
          shortLabel: STEP_META[key].shortLabel,
          railSubtitle: STEP_META[key].railSubtitle,
          isConditional: key === 'aptitude-test',
          isActive,
          displayNumber: isActive ? activeIdx + 1 : null,
          isCurrent: key === currentStep,
          isCompleted: completedSteps.has(key),
        };
      }),
    [steps, currentStep, completedSteps],
  );

  return {
    currentStep,
    currentNumber,
    totalSteps,
    goToNext,
    goToBack,
    goToStep,
    markCompleted,
    completeProfilStep,
    questionnaireData,
    stepperItems,
  };
}
