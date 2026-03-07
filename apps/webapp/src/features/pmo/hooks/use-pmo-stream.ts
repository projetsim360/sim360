import { useState, useCallback, useRef } from 'react';
import { pmoApi } from '../api/pmo.api';

export function usePmoStream(simulationId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      setIsStreaming(true);
      setStreamedContent('');

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await pmoApi.chat(simulationId, message);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Erreur lors de la communication avec l\'agent PMO',
          }));
          throw new Error(errorData.message || 'Erreur serveur');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Flux de lecture non disponible');
        }

        const decoder = new TextDecoder();
        let accumulated = '';
        let buffer = '';

        while (true) {
          if (controller.signal.aborted) break;

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            try {
              const parsed = JSON.parse(trimmed.slice(6));
              if (parsed.token) {
                accumulated += parsed.token;
                setStreamedContent(accumulated);
              }
              if (parsed.done) {
                setIsStreaming(false);
                return accumulated;
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete chunks
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }

        setIsStreaming(false);
        return accumulated;
      } catch (error) {
        setIsStreaming(false);
        if ((error as Error).name === 'AbortError') {
          return streamedContent;
        }
        throw error;
      }
    },
    [simulationId, streamedContent],
  );

  return { sendMessage, isStreaming, streamedContent, cancelStream };
}
