import { OnboardingStepper } from './onboarding-stepper';
import { OnboardingLivePreview } from './onboarding-live-preview';
import type { UserProfile } from '../types/profile.types';
import type { OnboardingStep, StepperItem, OnboardingLiveState } from '../config/onboarding.config';

interface OnboardingTopbarProps {
  items: StepperItem[];
  currentStep: OnboardingStep;
  currentNumber: number;
  totalSteps: number;
  profile?: UserProfile;
  live: OnboardingLiveState;
  onStepClick: (step: OnboardingStep) => void;
}

export function OnboardingTopbar({
  items,
  currentStep,
  currentNumber,
  totalSteps,
  profile,
  live,
  onStepClick,
}: OnboardingTopbarProps) {
  return (
    <div className="sticky top-0 z-20 lg:hidden">
      <div
        className="p-4 text-white"
        style={{ background: 'linear-gradient(165deg, var(--brand-700), var(--brand-900))' }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-sm font-extrabold">
            <span className="flex size-6 items-center justify-center rounded-md bg-[var(--accent-500)] text-xs">
              S
            </span>
            Simex pro
          </span>
          <span className="text-[11px] text-[var(--brand-300)]">
            Étape {currentNumber} sur {totalSteps}
          </span>
        </div>
        <div className="mt-3">
          <OnboardingStepper items={items} orientation="horizontal" onStepClick={onStepClick} />
        </div>
      </div>
      <OnboardingLivePreview profile={profile} currentStep={currentStep} live={live} variant="accordion" />
    </div>
  );
}
