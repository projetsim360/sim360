import { OnboardingStepper } from './onboarding-stepper';
import { OnboardingLivePreview } from './onboarding-live-preview';
import type { UserProfile } from '../types/profile.types';
import type { OnboardingStep, StepperItem, OnboardingLiveState } from '../config/onboarding.config';

interface OnboardingRailProps {
  items: StepperItem[];
  currentStep: OnboardingStep;
  profile?: UserProfile;
  live: OnboardingLiveState;
  onStepClick: (step: OnboardingStep) => void;
}

export function OnboardingRail({ items, currentStep, profile, live, onStepClick }: OnboardingRailProps) {
  return (
    <aside
      className="hidden w-[300px] shrink-0 flex-col p-6 text-white lg:flex lg:h-screen lg:overflow-y-auto"
      style={{ background: 'linear-gradient(165deg, var(--brand-700), var(--brand-900))' }}
    >
      <div className="mb-9 flex items-center gap-2.5">
        <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-[var(--accent-500)] font-display text-base font-extrabold">
          S
        </span>
        <span className="font-display text-[17px] font-extrabold tracking-tight">Simex pro</span>
      </div>
      <OnboardingStepper items={items} orientation="vertical" onStepClick={onStepClick} />
      <OnboardingLivePreview profile={profile} currentStep={currentStep} live={live} variant="rail" />
    </aside>
  );
}
