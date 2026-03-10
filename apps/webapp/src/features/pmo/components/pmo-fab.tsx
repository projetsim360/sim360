import { useState, useEffect, useMemo } from 'react';
import { KeenIcon } from '@/components/keenicons';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PmoChat } from './pmo-chat';
import { PmoContextPanel } from './pmo-context-panel';
import { usePmoHistory, usePmoContext } from '../api/pmo.api';
import { useProfileAdaptation } from '@/features/profile/api/profile.api';

interface PmoFabProps {
  simulationId: string;
  pendingActionsCount?: number;
}

const TOOLTIP_STORAGE_KEY = 'pmo_fab_tooltip_seen';

export function PmoFab({ simulationId, pendingActionsCount = 0 }: PmoFabProps) {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const { data: historyData, isLoading: isLoadingHistory } = usePmoHistory(
    simulationId,
    open,
  );
  const { data: context, isLoading: isLoadingContext } = usePmoContext(
    simulationId,
    open,
  );
  const { data: adaptation } = useProfileAdaptation();

  const pendingDeliverables = useMemo(
    () => context?.deliverables.pending ?? [],
    [context],
  );

  // Show tooltip on first visit
  useEffect(() => {
    const seen = localStorage.getItem(TOOLTIP_STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setShowTooltip(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_STORAGE_KEY, 'true');
  };

  const handleOpen = () => {
    dismissTooltip();
    setOpen(true);
  };

  return (
    <>
      {/* Tooltip bulle */}
      {showTooltip && (
        <div className="fixed bottom-24 right-6 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="relative bg-card border border-border rounded-2xl rounded-br-md p-4 max-w-[280px] shadow-lg">
            <button
              onClick={dismissTooltip}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <KeenIcon icon="cross" style="duotone" className="size-3" />
            </button>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0">
                <KeenIcon icon="abstract-26" style="duotone" className="size-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Je suis votre Agent PMO
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Si vous avez besoin de conseils, d'aide sur vos livrables ou pour prendre une decision, je suis la !
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleOpen}
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'size-14 rounded-full',
          'bg-brand-500 hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300',
          'text-white dark:text-brand-950',
          'flex items-center justify-center',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-200 hover:scale-105',
          'cursor-pointer',
          'focus-visible:outline-ring',
        )}
        aria-label="Ouvrir l'Agent PMO"
      >
        <KeenIcon icon="user" style="duotone" className="size-6" />

        {/* Badge notification */}
        {pendingActionsCount > 0 && (
          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
            {pendingActionsCount > 9 ? '9+' : pendingActionsCount}
          </span>
        )}
      </button>

      {/* Drawer — same pattern as NotificationsSheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="gap-0 sm:w-[500px] inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
          <SheetHeader className="mb-0">
            <SheetTitle className="p-3">Agent PMO</SheetTitle>
          </SheetHeader>
          <SheetBody className="grow p-0">
            <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
              <TabsList variant="line" className="w-full px-5 mb-0 shrink-0">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="context">Contexte</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-0 flex-1 min-h-0">
                <div className="h-[calc(100vh-10.5rem)] flex flex-col">
                  <PmoChat
                    simulationId={simulationId}
                    initialMessages={historyData?.data || []}
                    isLoadingHistory={isLoadingHistory}
                    enableGlossaryTooltips={adaptation?.showGlossaryTooltips ?? false}
                    pendingDeliverables={pendingDeliverables}
                    scenarioInfo={
                      context
                        ? {
                            companyName: context.scenario.title,
                            sector: context.scenario.sector,
                            objectives: context.scenario.objectives,
                          }
                        : undefined
                    }
                  />
                </div>
              </TabsContent>

              <TabsContent value="context" className="mt-0 flex-1 min-h-0">
                <ScrollArea className="h-[calc(100vh-10.5rem)]">
                  <PmoContextPanel
                    context={context}
                    isLoading={isLoadingContext}
                    collapsed={false}
                    onToggle={() => {}}
                    adaptation={adaptation}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}
