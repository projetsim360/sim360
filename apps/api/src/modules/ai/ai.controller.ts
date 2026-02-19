import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('complete')
  @ApiOperation({ summary: 'Generate AI completion' })
  complete(
    @Body()
    dto: {
      provider?: 'anthropic' | 'openai';
      prompt: string;
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    },
  ) {
    return this.aiService.complete(dto);
  }
}
