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
              <KeenIcon
                icon="abstract-26"
                style="solid"
                className="size-12 text-muted-foreground/30 mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Demarrez une conversation avec votre agent PMO.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
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
                  <Card className="border-primary/30 bg-primary/5 mb-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <KeenIcon icon="people" style="solid" className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground">
                            Bienvenue dans votre simulation
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
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
                    <KeenIcon icon="notification-on" style="solid" className="size-4 text-warning" />
                    <p className="text-sm text-foreground font-semibold">
                      Vous avez {pendingDeliverableCount} livrable{pendingDeliverableCount > 1 ? 's' : ''} a rendre
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pendingDeliverables.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-warning/15 hover:bg-warning/25 border border-warning/30 text-xs font-medium text-foreground transition-colors cursor-pointer"
                        onClick={() => {
                          setInput(`Quelles sont les attentes pour le livrable "${d.title}" ?`);
                          inputRef.current?.focus();
                        }}
                      >
                        <KeenIcon icon="document" style="outline" className="size-3 text-warning" />
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
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question a votre agent PMO..."
            disabled={isStreaming || isInitializing}
            className="flex-1"
          />
          {isStreaming ? (
            <Button
              variant="outline"
              size="icon"
              onClick={cancelStream}
              title="Arreter"
            >
              <KeenIcon icon="cross" style="outline" className="size-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isInitializing}
              title="Envoyer"
            >
              <KeenIcon icon="arrow-up" style="outline" className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
