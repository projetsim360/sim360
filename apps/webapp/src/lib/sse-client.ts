import { getAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface SseCallbacks {
  onToken?: (token: string) => void;
  onDone?: (usage?: { inputTokens: number; outputTokens: number }) => void;
  onError?: (error: string) => void;
}

/**
 * SSE via POST — uses fetch + ReadableStream since EventSource doesn't support POST/headers.
 */
export async function streamAiResponse(
  path: string,
  body: Record<string, unknown>,
  callbacks: SseCallbacks,
): Promise<void> {
  const token = getAccessToken();
  const url = `${BASE_URL}${path}?access_token=${encodeURIComponent(token ?? '')}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Erreur SSE' }));
    callbacks.onError?.(err.message);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.('Streaming non supporte');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const data = JSON.parse(jsonStr);
        if (data.token) {
          callbacks.onToken?.(data.token);
        } else if (data.done) {
          callbacks.onDone?.(data.usage);
        } else if (data.error) {
          callbacks.onError?.(data.error);
        }
      } catch {
        // Ignore malformed JSON
      }
    }
  }

  callbacks.onDone?.();
}
