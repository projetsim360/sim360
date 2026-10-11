import { WorkflowStepper, type WorkflowStep } from '@/components/ui/workflow-stepper';
import { useT } from '@/i18n/app/use-t';

interface Props {
  campaign: {
    status: string;
    generatedScenarioId?: string | null;
    _count?: { candidateResults: number };
  };
}

function getCampaignSteps(campaign: Props['campaign'], t: ReturnType<typeof useT>): WorkflowStep[] {
  const status = campaign.status;
  const hasScenario = !!campaign.generatedScenarioId;
  const candidateCount = campaign._count?.candidateResults ?? 0;
  const isActiveOrBeyond = ['ACTIVE', 'CLOSED', 'ARCHIVED'].includes(status);
  const isClosedOrArchived = ['CLOSED', 'ARCHIVED'].includes(status);

  return [
    {
      label: t('recruit.step.create'),
      status: 'completed',
    },
    {
      label: t('recruit.step.scenario'),
      status: hasScenario ? 'completed' : 'upcoming',
    },
    {
      label: t('recruit.step.publish'),
      status: isActiveOrBeyond ? 'completed' : 'upcoming',
    },
    {
      label: t('recruit.step.recruit'),
      status: isClosedOrArchived
        ? 'completed'
        : status === 'ACTIVE' && candidateCount > 0
          ? 'active'
          : 'upcoming',
    },
    {
      label: t('recruit.step.analyze'),
      status: isClosedOrArchived
        ? 'completed'
        : candidateCount > 0
          ? 'active'
          : 'upcoming',
    },
    {
      label: t('recruit.step.close'),
      status: isClosedOrArchived ? 'completed' : 'upcoming',
    },
  ];
}

export function CampaignWorkflowStepper({ campaign }: Props) {
  const t = useT();
  const steps = getCampaignSteps(campaign, t);

  return <WorkflowStepper steps={steps} size="sm" />;
}
