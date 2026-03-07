import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/components/layouts/layout-6/components/toolbar';
import { Button } from '@/components/ui/button';
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
