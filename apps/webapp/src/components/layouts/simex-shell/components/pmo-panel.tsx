import { useMemo, useState } from 'react';
import { Sparkles, X, MessageCircle, Layers, LifeBuoy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useShellState } from '../state/shell-state-provider';
import { useT } from '@/i18n/app/use-t';
import type { AppMessageKey } from '@/i18n/app/messages';
import { simulationApi } from '@/features/simulation/api/simulation.api';
import { usePmoHistory, usePmoContext } from '@/features/pmo/api/pmo.api';
import { useProfileAdaptation } from '@/features/profile/api/profile.api';
import { PmoChat } from '@/features/pmo/components/pmo-chat';
import { PmoContextPanel } from '@/features/pmo/components/pmo-context-panel';
import { HelpAssistant } from '@/features/assistant/components/help-assistant';

type Tab = 'aide' | 'chat' | 'contexte';

const SIM_STATUS_KEYS: Record<string, AppMessageKey> = {
  DRAFT: 'simulation.status.DRAFT',
  ONBOARDING: 'simulation.status.ONBOARDING',
  IN_PROGRESS: 'simulation.status.IN_PROGRESS',
  PAUSED: 'simulation.status.PAUSED',
  COMPLETED: 'simulation.status.COMPLETED',
  ABANDONED: 'simulation.status.ABANDONED',
};

function simulationLabel(s: any, t: ReturnType<typeof useT>): string {
  const name = s.project?.name || s.scenario?.title || t('shell.pmo.simulation');
  const key = SIM_STATUS_KEYS[s.status];
  return key ? `${name} · ${t(key)}` : name;
}

interface PmoPanelProps {
  className?: string;
}

export function PmoPanel({ className }: PmoPanelProps) {
  const { pmoOpen, setPmoOpen } = useShellState();
  const t = useT();
  // null = automatic: PMO chat during a simulation, help otherwise.
  const [pickedTab, setActiveTab] = useState<Tab | null>(null);
  const [overrideSimId, setOverrideSimId] = useState<string | null>(null);

  // Resolve the user's active simulation (only fetch while the panel is open)
  const { data: simulations } = useQuery({
    queryKey: ['simulations'],
    queryFn: () => simulationApi.getSimulations(),
    enabled: pmoOpen,
  });

  // The PMO assists during a live simulation — both the handover (ONBOARDING)
  // and the running project (IN_PROGRESS). Drafts and finished runs are excluded.
  const activeSimulations = useMemo(
    () =>
      (simulations ?? []).filter(
        (s: any) =>
          s.status === 'IN_PROGRESS' ||
          s.status === 'ACTIVE' ||
          s.status === 'ONBOARDING',
      ),
    [simulations],
  );

  // Default to a fully running simulation when there is one, otherwise the
  // first active simulation (e.g. one still in handover).
  const autoSimulationId =
    activeSimulations.find(
      (s: any) => s.status === 'IN_PROGRESS' || s.status === 'ACTIVE',
    )?.id ??
    activeSimulations[0]?.id ??
    null;

  // An explicit pick in the simulation selector overrides auto-resolution.
  // Falls back to auto if the picked simulation is no longer in-progress.
  const simulationId =
    overrideSimId && activeSimulations.some((s: any) => s.id === overrideSimId)
      ? overrideSimId
      : autoSimulationId;

  const { data: historyData, isLoading: isLoadingHistory } = usePmoHistory(
    simulationId ?? '',
    pmoOpen,
  );
  const { data: context, isLoading: isLoadingContext } = usePmoContext(
    simulationId ?? '',
    pmoOpen,
  );
  const { data: adaptation } = useProfileAdaptation();

  const pendingDeliverables = useMemo(
    () => context?.deliverables.pending ?? [],
    [context],
  );

  const headerSubtitle = !simulationId
    ? t('shell.pmo.noActive')
    : context?.currentPhase
      ? t('shell.pmo.phase', { order: context.simulation.currentPhaseOrder, name: context.currentPhase.name })
      : t('shell.pmo.online');

  const currentSim = activeSimulations.find((s: any) => s.id === simulationId);
  const activeTab: Tab = pickedTab ?? (simulationId ? 'chat' : 'aide');

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col overflow-hidden bg-card',
        // Mobile: full-screen overlay that slides from right
        'fixed inset-0 z-50',
        pmoOpen ? 'translate-x-0' : 'translate-x-full',
        'transition-transform duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        // Desktop: sticky inline panel beside main content
        'lg:sticky lg:inset-auto lg:z-auto lg:translate-x-0 lg:rounded-lg lg:self-start lg:my-4 lg:mr-4',
        'lg:top-4 lg:h-[calc(100vh-96px)]',
        pmoOpen ? 'lg:w-[460px] lg:opacity-100' : 'lg:w-0 lg:opacity-0',
        'lg:transition-[width,opacity,margin-right] lg:duration-[280ms]',
        className,
      )}
    >
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-[18px] py-4">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-[var(--accent-50)] text-[var(--accent-500)]">
          <Sparkles className="size-[18px]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-display text-[15px] font-bold text-foreground">{t('shell.topbar.assistant')}</span>
          <span className="inline-flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span
              className={cn(
                'size-[7px] shrink-0 rounded-full',
                simulationId ? 'bg-[var(--success-500)]' : 'bg-[var(--neutral-300)]',
              )}
              style={simulationId ? { boxShadow: '0 0 0 3px rgba(16,185,129,.18)' } : undefined}
            />
            <span className="truncate">{headerSubtitle}</span>
          </span>
        </div>
        {activeSimulations.length > 1 && (
          <Select value={simulationId ?? undefined} onValueChange={setOverrideSimId}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SelectTrigger
                  size="sm"
                  className="max-w-[150px] shrink-0 gap-1.5 rounded-full border-border bg-[var(--brand-50)] px-3 text-xs font-semibold text-[var(--brand-700)]"
                >
                  <SelectValue placeholder={t('shell.pmo.pick')}>
                    {currentSim?.project?.name ?? currentSim?.scenario?.title ?? t('shell.pmo.pick')}
                  </SelectValue>
                </SelectTrigger>
              </TooltipTrigger>
              <TooltipContent>
                {currentSim ? simulationLabel(currentSim, t) : t('shell.pmo.pick')}
              </TooltipContent>
            </Tooltip>
            <SelectContent>
              {activeSimulations.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {simulationLabel(s, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <button
          type="button"
          aria-label={t('common.close')}
          onClick={() => setPmoOpen(false)}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-border px-[18px] py-3">
        <button
          type="button"
          onClick={() => setActiveTab('aide')}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-0 px-3 py-2 text-[13px] font-semibold transition-colors duration-150',
            activeTab === 'aide'
              ? 'bg-[var(--brand-50)] text-[var(--brand-700)]'
              : 'bg-transparent font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <LifeBuoy className="size-3.5" />
          {t('shell.pmo.tab.help')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-0 px-3 py-2 text-[13px] font-semibold transition-colors duration-150',
            activeTab === 'chat'
              ? 'bg-[var(--brand-50)] text-[var(--brand-700)]'
              : 'bg-transparent font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <MessageCircle className="size-3.5" />
          {t('shell.pmo.tab.chat')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contexte')}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-sm border-0 px-3 py-2 text-[13px] font-semibold transition-colors duration-150',
            activeTab === 'contexte'
              ? 'bg-[var(--brand-50)] text-[var(--brand-700)]'
              : 'bg-transparent font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <Layers className="size-3.5" />
          {t('shell.pmo.tab.context')}
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        {activeTab === 'aide' ? (
          <div className="flex-1 min-h-0">
            <HelpAssistant onNavigate={() => setPmoOpen(false)} />
          </div>
        ) : !simulationId ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon="abstract-26"
              title={t('shell.pmo.noActive')}
              description={t('shell.pmo.emptyText')}
              action={{ label: t('shell.pmo.emptyCta'), href: '/simulations' }}
            />
          </div>
        ) : activeTab === 'chat' ? (
          <div className="flex-1 min-h-0">
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
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <PmoContextPanel
              context={context}
              isLoading={isLoadingContext}
              collapsed={false}
              onToggle={() => {}}
              adaptation={adaptation}
            />
          </ScrollArea>
        )}
      </div>
    </aside>
  );
}
