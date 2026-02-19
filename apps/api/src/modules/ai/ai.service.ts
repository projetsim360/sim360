import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private config: ConfigService) {}

  async complete(dto: {
    provider?: 'anthropic' | 'openai';
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    const provider = dto.provider || this.config.get<string>('ai.defaultProvider', 'anthropic');

    if (provider === 'anthropic') {
      return this.completeWithAnthropic(dto);
    }
    return this.completeWithOpenAI(dto);
  }

  private async completeWithAnthropic(dto: {
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    // TODO: Implement Anthropic SDK call
    this.logger.warn('Anthropic AI service not yet configured');
    return {
      content: 'Anthropic AI placeholder response',
      provider: 'anthropic' as const,
      model: 'claude-sonnet-4-20250514',
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  private async completeWithOpenAI(dto: {
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    // TODO: Implement OpenAI SDK call
    this.logger.warn('OpenAI AI service not yet configured');
    return {
      content: 'OpenAI AI placeholder response',
      provider: 'openai' as const,
      model: 'gpt-4o',
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }
}
