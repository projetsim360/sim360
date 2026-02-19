export type AiProvider = 'anthropic' | 'openai';

export interface AiCompletionRequest {
  provider?: AiProvider;
  model?: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiCompletionResponse {
  content: string;
  provider: AiProvider;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
