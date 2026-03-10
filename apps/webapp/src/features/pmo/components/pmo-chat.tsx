import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeenIcon } from '@/components/keenicons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PmoMessageBubble, StreamingBubble } from './pmo-message-bubble';
import { usePmoStream } from '../hooks/use-pmo-stream';
import { pmoApi, PMO_QUERY_KEYS } from '../api/pmo.api';
import type { PmoMessage } from '../types/pmo.types';

interface PendingDeliverable {
  id: string;
  title: string;
  type: string;
  status: string;
  phaseOrder: number;
  dueDate: string | null;
}

interface PmoChatScenarioInfo {
  companyName: string;
  sector: string;
  objectives: string[];
}

interface PmoChatProps {
  simulationId: string;
  initialMessages: PmoMessage[];
  isLoadingHistory: boolean;
  enableGlossaryTooltips?: boolean;
  pendingDeliverables?: PendingDeliverable[];
  scenarioInfo?: PmoChatScenarioInfo;
}

export function PmoChat({
  simulationId,
  initialMessages,
  isLoadingHistory,
  enableGlossaryTooltips = false,
  pendingDeliverables = [],
  scenarioInfo,
}: PmoChatProps) {
  const pendingDeliverableCount = pendingDeliverables.length;
  const [messages, setMessages] = useState<PmoMessage[]>([]);
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { sendMessage, isStreaming, streamedContent, cancelStream } =
    usePmoStream(simulationId);

  // Sync initial messages
  useEffect(() => {
    if (Array.isArray(initialMessages) && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamedContent]);

  // Init conversation if no messages
  useEffect(() => {
    if (!isLoadingHistory && initialMessages.length === 0 && messages.length === 0) {
      setIsInitializing(true);
      pmoApi
        .initConversation(simulationId)
        .then((initMessages) => {
          setMessages(Array.isArray(initMessages) ? initMessages : []);
          queryClient.invalidateQueries({
            queryKey: PMO_QUERY_KEYS.history(simulationId),
          });
        })
        .catch(() => {
          toast.error('Impossible d\'initialiser la conversation avec l\'agent PMO.');
        })
        .finally(() => setIsInitializing(false));
    }
  }, [isLoadingHistory, initialMessages.length, messages.length, simulationId, queryClient]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: PmoMessage = {
      id: `temp-${Date.now()}`,
      conversationId: '',
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const fullContent = await sendMessage(trimmed);

      const assistantMessage: PmoMessage = {
        id: `temp-assistant-${Date.now()}`,
        conversationId: '',
        role: 'assistant',
        content: fullContent,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      queryClient.invalidateQueries({
        queryKey: PMO_QUERY_KEYS.history(simulationId),
      });
    } catch (error) {
      toast.error(
        (error as Error).message ||
          'Erreur lors de la communication avec l\'agent PMO.',
      );
    }

    inputRef.current?.focus();
  }, [input, isStreaming, sendMessage, simulationId, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          {isLoadingHistory || isInitializing ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-14 rounded-2xl bg-brand-50 dark:bg-brand-800/30 flex items-center justify-center mb-4">
                <KeenIcon
                  icon="abstract-26"
                  style="duotone"
                  className="size-7 text-brand-500 dark:text-brand-400"
                />
              </div>
              <p className="text-sm font-medium text-foreground">
                Demarrez une conversation avec votre agent PMO
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Il peut vous aider sur la gestion de projet, les livrables, les
                decisions a prendre...
              </p>
            </div>
          ) : (
            <>
              {/* Welcome card for the first system/assistant message */}
              {messages.length > 0 &&
                messages[0].role !== 'user' &&
                scenarioInfo && (
                  <Card className="border-0 shadow-none bg-brand-50/50 dark:bg-brand-900/20 mb-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 size-10 rounded-xl bg-brand-500 flex items-center justify-center">
                          <KeenIcon icon="people" style="duotone" className="size-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground">
                            Bienvenue dans votre simulation
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {scenarioInfo.companyName} — {scenarioInfo.sector}
                          </p>
                          {scenarioInfo.objectives.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {scenarioInfo.objectives.map((obj, i) => (
                                <Badge key={i} variant="primary" appearance="light" size="xs">
                                  {obj}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Pending deliverables banner */}
              {pendingDeliverableCount > 0 && messages.length > 0 && (
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <KeenIcon icon="notification-on" style="duotone" className="size-4 text-warning" />
                    <p className="text-sm text-foreground font-semibold">
                      Vous avez {pendingDeliverableCount} livrable{pendingDeliverableCount > 1 ? 's' : ''} a rendre
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pendingDeliverables.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-warning/15 hover:bg-warning/25 border border-warning/30 text-sm font-medium text-foreground transition-colors cursor-pointer"
                        onClick={() => {
                          setInput(`Quelles sont les attentes pour le livrable "${d.title}" ?`);
                          inputRef.current?.focus();
                        }}
                      >
                        <KeenIcon icon="notepad" style="duotone" className="text-sm text-warning" />
                        {d.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <PmoMessageBubble
                  key={msg.id}
                  message={msg}
                  enableGlossaryTooltips={enableGlossaryTooltips}
                />
              ))}
            </>
          )}

          {/* Streaming bubble */}
          {isStreaming && <StreamingBubble content={streamedContent} />}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border p-3 bg-muted/30 dark:bg-white/3">
        <div className="flex items-center gap-2 rounded-xl bg-card dark:bg-white/5 border border-border px-3 py-1.5">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question a votre agent PMO..."
            disabled={isStreaming || isInitializing}
            className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:outline-none bg-transparent px-0 h-9"
          />
          {isStreaming ? (
            <Button
              variant="outline"
              size="icon"
              onClick={cancelStream}
              title="Arreter"
              className="shrink-0 size-8 rounded-lg"
            >
              <KeenIcon icon="cross" style="duotone" className="size-3.5" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isInitializing}
              title="Envoyer"
              className="shrink-0 size-8 rounded-lg"
            >
              <KeenIcon icon="arrow-up" style="duotone" className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
