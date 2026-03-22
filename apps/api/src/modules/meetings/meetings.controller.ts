import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard, CurrentUser, CurrentTenant } from '@sim360/core';
import { MeetingsService } from './meetings.service';
import { HandoverService } from './handover.service';
import { SendMessageDto, CreateRealtimeSessionsDto } from './dto';

@ApiTags('Meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MeetingsController {
  constructor(
    private meetingsService: MeetingsService,
    private handoverService: HandoverService,
  ) {}

  @Get('simulations/:simId/meetings')
  @ApiOperation({ summary: 'List meetings for a simulation' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by meeting type (KICKOFF, STEERING, etc.)' })
  @ApiQuery({ name: 'phaseOrder', required: false, type: Number, description: 'Filter by phase order' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (SCHEDULED, IN_PROGRESS, COMPLETED)' })
  findAllBySimulation(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @Query('type') type?: string,
    @Query('phaseOrder') phaseOrder?: number,
    @Query('status') status?: string,
  ) {
    return this.meetingsService.findAllBySimulation(simId, user.id, { type, phaseOrder, status });
  }

  @Get('meetings/:id')
  @ApiOperation({ summary: 'Get meeting details' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.meetingsService.findOne(id, user.id);
  }

  @Post('meetings/:id/start')
  @ApiOperation({ summary: 'Start a meeting' })
  start(@Param('id') id: string, @CurrentUser() user: any) {
    return this.meetingsService.start(id, user.id);
  }

  @Post('meetings/:id/messages')
  @ApiOperation({ summary: 'Send message and receive AI response (SSE stream)' })
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream$ = this.meetingsService.sendMessage(id, user.id, dto);
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

  @Post('meetings/:id/complete')
  @ApiOperation({ summary: 'Complete a meeting and generate summary' })
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.meetingsService.complete(id, user.id);
  }

  @Get('meetings/:id/summary')
  @ApiOperation({ summary: 'Get meeting summary' })
  getSummary(@Param('id') id: string, @CurrentUser() user: any) {
    return this.meetingsService.getSummary(id, user.id);
  }

  @Post('meetings/:id/realtime-session')
  @ApiOperation({ summary: 'Create ephemeral token for OpenAI Realtime audio (single participant)' })
  createRealtimeSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.meetingsService.createRealtimeSession(id, user.id);
  }

  @Post('meetings/:id/realtime-sessions')
  @ApiOperation({ summary: 'Create realtime sessions for all or selected participants' })
  createRealtimeSessions(
    @Param('id') id: string,
    @Body() dto: CreateRealtimeSessionsDto,
    @CurrentUser() user: any,
  ) {
    return this.meetingsService.createRealtimeSessions(id, user.id, dto.participantIds);
  }

  @Post('meetings/:id/realtime-session/:pid')
  @ApiOperation({ summary: 'Create realtime session for a specific participant' })
  createRealtimeSessionForParticipant(
    @Param('id') id: string,
    @Param('pid') pid: string,
    @CurrentUser() user: any,
  ) {
    return this.meetingsService.createRealtimeSession(id, user.id, pid);
  }

  @Post('meetings/:id/transcriptions')
  @ApiOperation({ summary: 'Save audio transcriptions as meeting messages' })
  saveTranscriptions(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: { transcriptions: Array<{ role: 'user' | 'assistant'; content: string; participantId?: string }> },
  ) {
    return this.meetingsService.saveTranscriptions(id, user.id, dto.transcriptions);
  }

  // ─── Handover endpoints ─────────────────────────────────

  @Get('simulations/:simId/handover')
  @ApiOperation({ summary: 'Get handover status (HR + PMO meetings)' })
  getHandoverStatus(@Param('simId') simId: string) {
    return this.handoverService.getHandoverStatus(simId);
  }

  @Post('simulations/:simId/handover/complete')
  @ApiOperation({ summary: 'Finalize handover and transition to IN_PROGRESS' })
  completeHandover(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.handoverService.completeHandover(simId, user.id, tenantId);
  }
}
