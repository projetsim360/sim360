import { registerAs } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  defaultProvider: process.env.AI_DEFAULT_PROVIDER || 'anthropic',
}));
