import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { PmoChat } from '../components/pmo-chat';
import { PmoContextPanel } from '../components/pmo-context-panel';
import { usePmoHistory, usePmoContext } from '../api/pmo.api';
import { useProfileAdaptation } from '@/features/profile/api/profile.api';

export default function PmoChatPage() {
  const { id } = useParams<{ id: string }>();
  const [contextCollapsed, setContextCollapsed] = useState(false);

  const {
    data: historyData,
    isLoading: isLoadingHistory,
  } = usePmoHistory(id || '');

  const {
    data: context,
    isLoading: isLoadingContext,
  } = usePmoContext(id || '');

  const { data: adaptation } = useProfileAdaptation();

  const pendingCount = useMemo(
    () => context?.deliverables.pending.length ?? 0,
    [context],
  );

  if (!id) {
    return (
      <div className="container-fixed">
        <Toolbar>
          <ToolbarHeading title="Agent PMO" />
        </Toolbar>
        <p className="text-sm text-muted-foreground">
          Aucune simulation selectionnee.
        </p>
      </div>
    );
  }

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Agent PMO" />
        <ToolbarActions>
          {pendingCount > 0 && (
            <Badge variant="warning" appearance="light" size="sm">
              <KeenIcon icon="notification-on" style="outline" className="size-3.5 mr-1" />
              {pendingCount} rappel{pendingCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setContextCollapsed(!contextCollapsed)}
          >
            <KeenIcon icon="setting-2" style="outline" className="size-4" />
            {contextCollapsed ? 'Afficher contexte' : 'Masquer contexte'}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/simulations/${id}`}>
              <KeenIcon icon="arrow-left" style="outline" className="size-4" />
              Retour
            </Link>
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="container-fixed">
        <div className="flex bg-background border border-border rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Chat */}
          <div className="flex-1 flex flex-col min-w-0">
            <PmoChat
              simulationId={id}
              initialMessages={historyData?.data || []}
              isLoadingHistory={isLoadingHistory}
              enableGlossaryTooltips={adaptation?.showGlossaryTooltips ?? false}
              pendingDeliverableCount={pendingCount}
              scenarioInfo={context ? {
                companyName: context.scenario.title,
                sector: context.scenario.sector,
                objectives: context.scenario.objectives,
              } : undefined}
            />
          </div>

          {/* Context panel */}
          <PmoContextPanel
            context={context}
            isLoading={isLoadingContext}
            collapsed={contextCollapsed}
            onToggle={() => setContextCollapsed(!contextCollapsed)}
            adaptation={adaptation}
          />
        </div>
      </div>
    </>
  );
}
