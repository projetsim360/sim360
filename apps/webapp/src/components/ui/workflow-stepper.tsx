import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { KeenIcon } from '@/components/keenicons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowStep {
  label: string;
  status: 'completed' | 'active' | 'upcoming' | 'disabled';
  description?: string;
  onClick?: () => void;
}

const stepperVariants = cva('flex items-center w-full', {
  variants: {
    size: {
      sm: 'gap-0',
      md: 'gap-0',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const circleVariants = cva(
  'relative z-10 flex items-center justify-center rounded-full font-medium shrink-0 transition-colors',
  {
    variants: {
      status: {
        completed: 'bg-primary text-primary-foreground',
        active: 'bg-[var(--accent-brand)] text-white ring-2 ring-[var(--accent-brand)]/15',
        upcoming: 'bg-secondary text-muted-foreground',
        disabled: 'bg-secondary text-muted-foreground opacity-50',
      },
      size: {
        sm: 'size-6 text-xs',
        md: 'size-8 text-sm',
      },
    },
    defaultVariants: {
      status: 'upcoming',
      size: 'md',
    },
  },
);

const lineVariants = cva('flex-1 h-0.5 transition-colors', {
  variants: {
    status: {
      completed: 'bg-primary',
      active: 'bg-primary/40 border-0 border-dashed',
      upcoming: 'bg-muted',
      disabled: 'bg-muted opacity-50',
    },
    size: {
      sm: 'min-w-4',
      md: 'min-w-6',
    },
  },
  defaultVariants: {
    status: 'upcoming',
    size: 'md',
  },
});

const labelVariants = cva('mt-2 text-center font-medium leading-tight max-w-20 truncate', {
  variants: {
    status: {
      completed: 'text-foreground',
      active: 'text-primary',
      upcoming: 'text-muted-foreground',
      disabled: 'text-muted-foreground opacity-50',
    },
    size: {
      sm: 'text-xs',
      md: 'text-xs',
    },
  },
  defaultVariants: {
    status: 'upcoming',
    size: 'md',
  },
});

interface WorkflowStepperProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stepperVariants> {
  steps: WorkflowStep[];
}

function WorkflowStepper({ steps, size = 'md', className, ...props }: WorkflowStepperProps) {
  return (
    <div data-slot="workflow-stepper" className={cn(stepperVariants({ size }), className)} {...props}>
      {steps.map((step, index) => {
        const isClickable = step.onClick && step.status !== 'disabled';
        const lineStatus = getLineStatus(step.status, steps[index + 1]?.status);

        const circleContent = (
          <div
            data-slot="workflow-step"
            className={cn(
              circleVariants({ status: step.status, size }),
              isClickable && 'cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2',
            )}
            onClick={isClickable ? step.onClick : undefined}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      step.onClick?.();
                    }
                  }
                : undefined
            }
          >
            {step.status === 'completed' ? (
              <KeenIcon icon="check" style="solid" className={size === 'sm' ? 'text-xs' : 'text-sm'} />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        );

        const stepNode = (
          <div key={index} className="flex flex-col items-center">
            {step.description ? (
              <Tooltip>
                <TooltipTrigger asChild>{circleContent}</TooltipTrigger>
                <TooltipContent>{step.description}</TooltipContent>
              </Tooltip>
            ) : (
              circleContent
            )}
            <span className={cn(labelVariants({ status: step.status, size }))}>{step.label}</span>
          </div>
        );

        return (
          <React.Fragment key={index}>
            {stepNode}
            {index < steps.length - 1 && (
              <div className={cn(lineVariants({ status: lineStatus, size }), 'self-start mt-3 md:mt-4')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function getLineStatus(
  currentStatus: WorkflowStep['status'],
  nextStatus?: WorkflowStep['status'],
): WorkflowStep['status'] {
  if (currentStatus === 'completed' && nextStatus === 'completed') return 'completed';
  if (currentStatus === 'completed' && nextStatus === 'active') return 'completed';
  if (currentStatus === 'active') return 'active';
  if (currentStatus === 'disabled' || nextStatus === 'disabled') return 'disabled';
  return 'upcoming';
}

export { WorkflowStepper, type WorkflowStep, type WorkflowStepperProps };
