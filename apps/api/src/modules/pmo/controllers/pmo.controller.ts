import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Auditable } from '@sim360/core';
import { PmoService } from '../services/pmo.service';
import { AiService } from '../../ai/ai.service';
import { SendPmoMessageDto } from '../dto';

@ApiTags('PMO')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('simulations/:simulationId/pmo')
export class PmoController {
  constructor(
    private readonly pmoService: PmoService,
    private readonly aiService: AiService,
  ) {}

  @Post('chat')
  @Auditable('PMO_CHAT', 'PmoConversation')
  @ApiOperation({ summary: 'Envoyer un message au PMO (SSE streaming)' })
  @ApiParam({ name: 'simulationId', description: 'ID de la simulation' })
  chat(
    @Param('simulationId') simulationId: string,
    @Body() dto: SendPmoMessageDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream$ = this.pmoService.chat(
      simulationId,
      user.id,
      tenantId,
      dto.message,
    );

    stream$.subscribe({
      next: (event) => {
        res.write(`data: ${event.data}\n\n`);
      },
      error: (err) => {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      },
      complete: () => {
        res.end();
      },
    });
  }

  @Get('history')
  @ApiOperation({ summary: 'Historique de conversation PMO pagine' })
  @ApiParam({ name: 'simulationId', description: 'ID de la simulation' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numero de page' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de messages par page' })
  getHistory(
    @Param('simulationId') simulationId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.pmoService.getHistory(simulationId, user.id, tenantId, page, limit);
  }

  @Get('context')
  @ApiOperation({ summary: 'Contexte actuel de la simulation pour le PMO' })
  @ApiParam({ name: 'simulationId', description: 'ID de la simulation' })
  getContext(
    @Param('simulationId') simulationId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pmoService.getContext(simulationId, user.id, tenantId);
  }

  @Post('init')
  @Auditable('PMO_INIT', 'PmoConversation')
  @ApiOperation({ summary: 'Initialiser la conversation PMO avec message d\'accueil' })
  @ApiParam({ name: 'simulationId', description: 'ID de la simulation' })
  initConversation(
    @Param('simulationId') simulationId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pmoService.initConversation(simulationId, user.id, tenantId);
  }

  @Post('transcribe')
  @Auditable('PMO_TRANSCRIBE', 'PmoConversation')
  @ApiOperation({ summary: 'Transcrire un audio vocal pour le chat PMO (Whisper)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'simulationId', description: 'ID de la simulation' })
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(
    @Param('simulationId') simulationId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Fichier audio requis');
    }

    const text = await this.aiService.transcribe(file.buffer, file.originalname);
    return { text };
  }
}
