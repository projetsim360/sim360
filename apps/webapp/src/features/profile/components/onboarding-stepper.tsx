import { cn } from '@/lib/utils';
import { Check } from '@/components/keenicons/icons';
import type { OnboardingStep } from '../hooks/use-onboarding';

interface OnboardingStepperProps {
  steps: OnboardingStep[];
  currentStep: OnboardingStep;
  isStepCompleted: (step: OnboardingStep) => boolean;
  stepLabels: Record<OnboardingStep, string>;
  onStepClick?: (step: OnboardingStep) => void;
}

export function OnboardingStepper({
  steps,
  currentStep,
  isStepCompleted,
  stepLabels,
  onStepClick,
}: OnboardingStepperProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = isStepCompleted(step);
        const isLast = index === steps.length - 1;

        return (
          <div key={step} className="flex items-center">
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => onStepClick?.(step)}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isCompleted && !isActive && 'border-primary bg-primary/10 text-primary',
                  !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="text-base" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium whitespace-nowrap',
                  isActive && 'text-primary',
                  isCompleted && !isActive && 'text-primary/80',
                  !isActive && !isCompleted && 'text-muted-foreground',
                )}
              >
                {stepLabels[step]}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 w-12 lg:w-20 mx-2 mt-[-1rem] transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
