import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Toolbar, ToolbarHeading } from '@/components/layouts/layout-6/components/toolbar';
import { simulationApi } from '@/features/simulation/api/simulation.api';
import { ActionItemsPanel } from '../components/action-items-panel';

export default function ActionItemsPage() {
  const { id } = useParams<{ id: string }>();
  const simulationQuery = useQuery({
    queryKey: ['simulation', id],
    queryFn: () => simulationApi.getSimulation(id!),
    enabled: !!id,
  });

  // Owners offered: everyone the learner met in this simulation's meetings, plus the project team.
  const names = new Set<string>();
  for (const m of simulationQuery.data?.meetings ?? []) {
    for (const p of (m as { participants?: Array<{ name: string }> }).participants ?? []) names.add(p.name);
  }
  for (const t of simulationQuery.data?.project?.teamMembers ?? []) names.add(t.name);

  if (!id) return null;

  return (
    <>
      <Toolbar>
        <ToolbarHeading
          title="Actions de suivi"
          description="Les actions décidées en réunion et celles que vous ajoutez : responsable, échéance et avancement."
        />
      </Toolbar>
      <div className="container-fixed">
        <ActionItemsPanel simulationId={id} assigneeSuggestions={[...names]} showMeeting title="Toutes les actions" />
      </div>
    </>
  );
}
