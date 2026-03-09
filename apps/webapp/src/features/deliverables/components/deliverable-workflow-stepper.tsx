import { WorkflowStepper, type WorkflowStep } from '@/components/ui/workflow-stepper';

interface Props {
  status: string;
}

function getDeliverableSteps(status: string): WorkflowStep[] {
  const isRejected = status === 'REJECTED';

  const past = (statuses: string[]) => statuses.includes(status);

  return [
    {
      label: 'Brouillon',
      status:
        status === 'DRAFT'
          ? 'active'
          : 'completed',
    },
    {
      label: 'Soumis',
      status:
        status === 'SUBMITTED'
          ? 'active'
          : past(['EVALUATED', 'REVISED', 'VALIDATED', 'REJECTED'])
            ? 'completed'
            : 'upcoming',
    },
    {
      label: isRejected ? 'Rejete' : 'Evalue',
      status: isRejected
        ? 'disabled'
        : status === 'EVALUATED'
          ? 'active'
          : past(['REVISED', 'VALIDATED'])
            ? 'completed'
            : 'upcoming',
    },
    {
      label: 'Revise',
      status:
        status === 'REVISED'
          ? 'active'
          : status === 'VALIDATED'
            ? 'completed'
            : 'upcoming',
    },
    {
      label: 'Valide',
      status:
        status === 'VALIDATED'
          ? 'completed'
          : 'upcoming',
    },
  ];
}

export function DeliverableWorkflowStepper({ status }: Props) {
  const steps = getDeliverableSteps(status);

  return <WorkflowStepper steps={steps} size="sm" />;
}
