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
    <div className="flex items-center justify-center w-full gap-0">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = isStepCompleted(step);
        const isLast = index === steps.length - 1;

        return (
          <div key={step} className="flex items-center">
            <div
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onStepClick?.(step)}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all shadow-sm',
                  isActive && 'border-primary bg-primary text-primary-foreground shadow-primary/20 shadow-md scale-110',
                  isCompleted && !isActive && 'border-primary bg-primary/10 text-primary group-hover:bg-primary/20',
                  !isActive && !isCompleted && 'border-border text-muted-foreground group-hover:border-muted-foreground/50',
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
                  'mt-2.5 text-xs font-medium whitespace-nowrap',
                  isActive && 'text-primary font-semibold',
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
                  'h-0.5 w-14 lg:w-24 mx-3 mt-[-1rem] transition-colors rounded-full',
                  isCompleted ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
