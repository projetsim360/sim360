import { WorkflowStepper, type WorkflowStep } from '@/components/ui/workflow-stepper';
import { useT } from '@/i18n/app/use-t';

interface Props {
  status: string;
}

function getDeliverableSteps(status: string, t: ReturnType<typeof useT>): WorkflowStep[] {
  const isRejected = status === 'REJECTED';

  const past = (statuses: string[]) => statuses.includes(status);

  return [
    {
      label: t('deliverableStatus.DRAFT'),
      status:
        status === 'DRAFT'
          ? 'active'
          : 'completed',
    },
    {
      label: t('deliverableStatus.SUBMITTED'),
      status:
        status === 'SUBMITTED'
          ? 'active'
          : past(['EVALUATED', 'REVISED', 'VALIDATED', 'REJECTED'])
            ? 'completed'
            : 'upcoming',
    },
    {
      label: isRejected ? t('deliverableStatus.REJECTED') : t('deliverableStatus.EVALUATED'),
      status: isRejected
        ? 'disabled'
        : status === 'EVALUATED'
          ? 'active'
          : past(['REVISED', 'VALIDATED'])
            ? 'completed'
            : 'upcoming',
    },
    {
      label: t('deliverableStatus.REVISED'),
      status:
        status === 'REVISED'
          ? 'active'
          : status === 'VALIDATED'
            ? 'completed'
            : 'upcoming',
    },
    {
      label: t('deliverableStatus.VALIDATED'),
      status:
        status === 'VALIDATED'
          ? 'completed'
          : 'upcoming',
    },
  ];
}

export function DeliverableWorkflowStepper({ status }: Props) {
  const t = useT();
  const steps = getDeliverableSteps(status, t);

  return <WorkflowStepper steps={steps} size="sm" />;
}
