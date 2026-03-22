import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  CurrentTenant,
  Roles,
  Auditable,
} from '@sim360/core';
import { UserRole } from '@prisma/client';
import { MentorReviewService, MentoringSessionService } from './services';
import {
  CreateMentorReviewDto,
  CreateMentoringSessionDto,
  SendMentoringMessageDto,
} from './dto';

@ApiTags('Mentoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mentoring')
export class MentoringController {
  constructor(
    private readonly mentorReviewService: MentorReviewService,
    private readonly mentoringSessionService: MentoringSessionService,
  ) {}

  // ─── Reviews ──────────────────────────────────────────────

  @Post('reviews')
  @Roles(UserRole.MENTOR)
  @Auditable('CREATE', 'MentorReview')
  @ApiOperation({ summary: 'Create a mentor review for an evaluation' })
  createReview(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateMentorReviewDto,
  ) {
    return this.mentorReviewService.create(user.id, tenantId, dto);
  }

  @Get('reviews/pending')
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'List evaluations pending mentor review' })
  getPendingReviews(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.mentorReviewService.findPending(user.id, tenantId);
  }

  @Get('reviews/:evaluationId')
  @ApiOperation({ summary: 'Get mentor review for an evaluation' })
  @ApiParam({ name: 'evaluationId', description: 'ID of the evaluation' })
  getReview(@Param('evaluationId') evaluationId: string) {
    return this.mentorReviewService.findByEvaluation(evaluationId);
  }

  @Put('reviews/:id')
  @Roles(UserRole.MENTOR)
  @Auditable('UPDATE', 'MentorReview')
  @ApiOperation({ summary: 'Update a mentor review' })
  @ApiParam({ name: 'id', description: 'ID of the mentor review' })
  updateReview(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateMentorReviewDto,
  ) {
    return this.mentorReviewService.update(id, user.id, dto);
  }

  // ─── Sessions ─────────────────────────────────────────────

  @Post('sessions')
  @Roles(UserRole.MENTOR)
  @Auditable('CREATE', 'MentoringSession')
  @ApiOperation({ summary: 'Create a mentoring session' })
  createSession(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateMentoringSessionDto,
  ) {
    return this.mentoringSessionService.create(user.id, tenantId, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List my mentoring sessions' })
  getSessions(
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.mentoringSessionService.findAll(user.id, tenantId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a mentoring session with messages' })
  @ApiParam({ name: 'id', description: 'ID of the mentoring session' })
  getSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mentoringSessionService.findOne(id, user.id);
  }

  @Post('sessions/:id/messages')
  @Auditable('SEND_MESSAGE', 'MentoringSession')
  @ApiOperation({ summary: 'Send a message in a mentoring session' })
  @ApiParam({ name: 'id', description: 'ID of the mentoring session' })
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SendMentoringMessageDto,
  ) {
    return this.mentoringSessionService.sendMessage(id, user.id, dto);
  }

  @Patch('sessions/:id/complete')
  @Roles(UserRole.MENTOR)
  @Auditable('COMPLETE', 'MentoringSession')
  @ApiOperation({ summary: 'Mark a mentoring session as completed' })
  @ApiParam({ name: 'id', description: 'ID of the mentoring session' })
  completeSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mentoringSessionService.complete(id, user.id);
  }
}
