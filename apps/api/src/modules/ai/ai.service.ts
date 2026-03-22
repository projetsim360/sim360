import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { RedisCacheService } from '@sim360/core';
import { Observable } from 'rxjs';
import { TokenTrackerService } from './services/token-tracker.service';

export interface AiCompletionResult {
  content: string;
  provider: 'anthropic' | 'openai';
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}

export interface AiCompletionOptions {
  provider?: 'anthropic' | 'openai';
  prompt: string;
  systemPrompt?: string;
  systemPromptCacheKey?: string;
  maxTokens?: number;
  temperature?: number;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  trackingContext?: {
    tenantId: string;
    userId: string;
    simulationId?: string;
    operation: string;
    metadata?: Record<string, unknown>;
  };
}

interface MessageEvent {
  data: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly anthropic: Anthropic | null;
  private readonly openai: OpenAI | null;

  constructor(
    private config: ConfigService,
    private cache: RedisCacheService,
    @Optional() private tokenTracker?: TokenTrackerService,
  ) {
    const anthropicKey = this.config.get<string>('ai.anthropicApiKey');
    const openaiKey = this.config.get<string>('ai.openaiApiKey');

    this.anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;
    this.openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
  }

  async complete(dto: AiCompletionOptions): Promise<AiCompletionResult> {
    // Check quota before calling AI
    if (dto.trackingContext && this.tokenTracker) {
      await this.tokenTracker.checkQuota(dto.trackingContext.tenantId);
    }

    const provider = dto.provider || this.config.get<string>('ai.defaultProvider', 'anthropic');

    // Resolve system prompt from cache if cacheKey provided
    const systemPrompt = await this.resolveSystemPrompt(dto.systemPrompt, dto.systemPromptCacheKey);

    const options = { ...dto, systemPrompt: systemPrompt ?? dto.systemPrompt };

    let result: AiCompletionResult;
    if (provider === 'anthropic') {
      result = await this.withFallback(
        () => this.completeWithAnthropic(options),
        () => this.completeWithOpenAI(options),
      );
    } else {
      result = await this.withFallback(
        () => this.completeWithOpenAI(options),
        () => this.completeWithAnthropic(options),
      );
    }

    // Fire-and-forget token tracking
    if (dto.trackingContext && this.tokenTracker) {
      this.tokenTracker.track(
        dto.trackingContext,
        result.provider,
        result.model,
        result.usage.inputTokens,
        result.usage.outputTokens,
      ).catch((err) => this.logger.warn(`Token tracking failed: ${err.message}`));
    }

    return result;
  }

  streamWithAnthropic(dto: AiCompletionOptions): Observable<MessageEvent> {
    return this.stream(dto);
  }

  stream(dto: AiCompletionOptions): Observable<MessageEvent> {
    const provider = dto.provider || this.config.get<string>('ai.defaultProvider', 'anthropic');
    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        // Check quota before streaming
        if (dto.trackingContext && this.tokenTracker) {
          try {
            await this.tokenTracker.checkQuota(dto.trackingContext.tenantId);
          } catch (err: any) {
            subscriber.next({ data: JSON.stringify({ error: err.message }) });
            subscriber.complete();
            return;
          }
        }

        const systemPrompt = await this.resolveSystemPrompt(dto.systemPrompt, dto.systemPromptCacheKey);
        const dtoResolved = { ...dto, systemPrompt: systemPrompt ?? dto.systemPrompt };

        // Try primary provider, fallback to other
        const primary = provider === 'anthropic' ? 'anthropic' : 'openai';
        const fallback = primary === 'anthropic' ? 'openai' : 'anthropic';

        try {
          await this.streamWithProvider(primary, dtoResolved, subscriber);
        } catch (primaryError: any) {
          this.logger.warn(`Primary streaming (${primary}) failed: ${primaryError.message}, trying ${fallback}...`);
          try {
            await this.streamWithProvider(fallback, dtoResolved, subscriber);
          } catch (fallbackError: any) {
            this.logger.error(`Fallback streaming (${fallback}) also failed: ${fallbackError.message}`);
            subscriber.next({ data: JSON.stringify({ error: primaryError.message }) });
            subscriber.complete();
          }
        }
      })();
    });
  }

  private async streamWithProvider(
    provider: 'anthropic' | 'openai',
    dto: AiCompletionOptions,
    subscriber: { next: (v: MessageEvent) => void; complete: () => void },
  ): Promise<void> {
    if (provider === 'anthropic') {
      await this.streamAnthropicInternal(dto, subscriber);
    } else {
      await this.streamOpenAIInternal(dto, subscriber);
    }
  }

  private async streamAnthropicInternal(
    dto: AiCompletionOptions,
    subscriber: { next: (v: MessageEvent) => void; complete: () => void },
  ): Promise<void> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key non configuree');
    }

    const messages = this.buildAnthropicMessages(dto);
    const stream = this.anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: dto.maxTokens ?? 200,
      temperature: dto.temperature ?? 0.7,
      system: dto.systemPrompt || undefined,
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        subscriber.next({ data: JSON.stringify({ token: event.delta.text }) });
      }
    }

    const finalMessage = await stream.finalMessage();
    const inputTokens = finalMessage.usage.input_tokens;
    const outputTokens = finalMessage.usage.output_tokens;

    subscriber.next({
      data: JSON.stringify({ done: true, usage: { inputTokens, outputTokens } }),
    });

    if (dto.trackingContext && this.tokenTracker) {
      this.tokenTracker.track(
        dto.trackingContext,
        'anthropic',
        finalMessage.model,
        inputTokens,
        outputTokens,
      ).catch((err) => this.logger.warn(`Stream token tracking failed: ${err.message}`));
    }

    subscriber.complete();
  }

  private async streamOpenAIInternal(
    dto: AiCompletionOptions,
    subscriber: { next: (v: MessageEvent) => void; complete: () => void },
  ): Promise<void> {
    if (!this.openai) {
      throw new Error('OpenAI API key non configuree');
    }

    const messages = this.buildOpenAIMessages(dto, dto.systemPrompt);
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: dto.maxTokens ?? 200,
      temperature: dto.temperature ?? 0.7,
      messages,
      stream: true,
    });

    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        subscriber.next({ data: JSON.stringify({ token: delta }) });
      }
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens ?? 0;
        outputTokens = chunk.usage.completion_tokens ?? 0;
      }
    }

    subscriber.next({
      data: JSON.stringify({ done: true, usage: { inputTokens, outputTokens } }),
    });

    if (dto.trackingContext && this.tokenTracker) {
      this.tokenTracker.track(
        dto.trackingContext,
        'openai',
        'gpt-4o',
        inputTokens,
        outputTokens,
      ).catch((err) => this.logger.warn(`Stream token tracking failed: ${err.message}`));
    }

    subscriber.complete();
  }

  /**
   * Transcribe audio using OpenAI Whisper API.
   */
  async transcribe(audioBuffer: Buffer, filename: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured. Set OPENAI_API_KEY.');
    }

    const file = new File([audioBuffer as unknown as BlobPart], filename, {
      type: 'audio/webm',
    });

    const response = await this.openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
      language: 'fr',
      response_format: 'text',
    });

    return typeof response === 'string'
      ? response
      : (response as any).text ?? '';
  }

  async cacheSystemPrompt(cacheKey: string, prompt: string, ttlSeconds = 3600): Promise<void> {
    await this.cache.set(`ai:sys:${cacheKey}`, prompt, ttlSeconds);
  }

  private async resolveSystemPrompt(
    systemPrompt?: string,
    cacheKey?: string,
  ): Promise<string | undefined> {
    if (cacheKey) {
      const cached = await this.cache.get<string>(`ai:sys:${cacheKey}`);
      if (cached) return cached;
      // If not cached but systemPrompt provided, cache it
      if (systemPrompt) {
        await this.cacheSystemPrompt(cacheKey, systemPrompt);
      }
    }
    return systemPrompt;
  }

  private async withFallback(
    primary: () => Promise<AiCompletionResult>,
    fallback: () => Promise<AiCompletionResult>,
  ): Promise<AiCompletionResult> {
    try {
      return await primary();
    } catch (primaryError: any) {
      this.logger.warn(`Primary provider failed: ${primaryError.message}, trying fallback...`);
      try {
        return await fallback();
      } catch (fallbackError: any) {
        this.logger.error(`Fallback provider also failed: ${fallbackError.message}`);
        throw primaryError;
      }
    }
  }

  private buildAnthropicMessages(dto: AiCompletionOptions): Array<{ role: 'user' | 'assistant'; content: string }> {
    if (dto.messages?.length) {
      return dto.messages;
    }
    return [{ role: 'user', content: dto.prompt }];
  }

  private buildOpenAIMessages(dto: AiCompletionOptions, systemPrompt?: string): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const msgs: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (systemPrompt) {
      msgs.push({ role: 'system', content: systemPrompt });
    }
    if (dto.messages?.length) {
      msgs.push(...dto.messages);
    } else {
      msgs.push({ role: 'user', content: dto.prompt });
    }
    return msgs;
  }

  private async completeWithAnthropic(dto: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key non configuree');
    }

    const messages = this.buildAnthropicMessages(dto);
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: dto.maxTokens ?? 1024,
      temperature: dto.temperature ?? 0.7,
      system: dto.systemPrompt || undefined,
      messages,
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return {
      content: textContent?.text ?? '',
      provider: 'anthropic',
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }

  private async completeWithOpenAI(dto: AiCompletionOptions): Promise<AiCompletionResult> {
    if (!this.openai) {
      throw new Error('OpenAI API key non configuree');
    }

    const messages = this.buildOpenAIMessages(dto, dto.systemPrompt);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: dto.maxTokens ?? 1024,
      temperature: dto.temperature ?? 0.7,
      messages,
    });

    return {
      content: response.choices[0]?.message?.content ?? '',
      provider: 'openai',
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    };
  }
}
