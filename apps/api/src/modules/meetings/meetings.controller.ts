import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { JwtAuthGuard, CurrentUser } from '@sim360/core';
import { MeetingsService } from './meetings.service';
import { SendMessageDto } from './dto';

interface MessageEvent {
  data: string;
}

@ApiTags('Meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MeetingsController {
  constructor(private meetingsService: MeetingsService) {}

  @Get('simulations/:simId/meetings')
  @ApiOperation({ summary: 'List meetings for a simulation' })
  findAllBySimulation(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
  ) {
    return this.meetingsService.findAllBySimulation(simId, user.id);
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

  @Sse('meetings/:id/messages')
  @ApiOperation({ summary: 'Send message and receive AI response (SSE)' })
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ): Observable<MessageEvent> {
    return this.meetingsService.sendMessage(id, user.id, dto);
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
}
