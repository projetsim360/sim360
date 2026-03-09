import { WorkflowStepper, type WorkflowStep } from '@/components/ui/workflow-stepper';

interface Props {
  campaign: {
    status: string;
    generatedScenarioId?: string | null;
    _count?: { candidateResults: number };
  };
}

function getCampaignSteps(campaign: Props['campaign']): WorkflowStep[] {
  const status = campaign.status;
  const hasScenario = !!campaign.generatedScenarioId;
  const candidateCount = campaign._count?.candidateResults ?? 0;
  const isActiveOrBeyond = ['ACTIVE', 'CLOSED', 'ARCHIVED'].includes(status);
  const isClosedOrArchived = ['CLOSED', 'ARCHIVED'].includes(status);

  return [
    {
      label: 'Creer',
      status: 'completed',
    },
    {
      label: 'Scenario',
      status: hasScenario ? 'completed' : 'upcoming',
    },
    {
      label: 'Publier',
      status: isActiveOrBeyond ? 'completed' : 'upcoming',
    },
    {
      label: 'Recruter',
      status: isClosedOrArchived
        ? 'completed'
        : status === 'ACTIVE' && candidateCount > 0
          ? 'active'
          : 'upcoming',
    },
    {
      label: 'Analyser',
      status: isClosedOrArchived
        ? 'completed'
        : candidateCount > 0
          ? 'active'
          : 'upcoming',
    },
    {
      label: 'Cloturer',
      status: isClosedOrArchived ? 'completed' : 'upcoming',
    },
  ];
}

export function CampaignWorkflowStepper({ campaign }: Props) {
  const steps = getCampaignSteps(campaign);

  return <WorkflowStepper steps={steps} size="sm" />;
}
