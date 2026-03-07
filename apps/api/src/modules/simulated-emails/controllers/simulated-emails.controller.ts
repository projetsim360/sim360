import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  CurrentTenant,
  Auditable,
} from '@sim360/core';
import { EmailPriority, EmailStatus } from '@prisma/client';
import { SimulatedEmailsService } from '../services/simulated-emails.service';
import { RespondEmailDto, GenerateEmailsDto } from '../dto';

@ApiTags('Simulated Emails')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SimulatedEmailsController {
  constructor(
    private readonly simulatedEmailsService: SimulatedEmailsService,
  ) {}

  // ─── List emails ────────────────────────────────────────────

  @Get('simulations/:simId/emails')
  @ApiOperation({ summary: 'Lister les emails d\'une simulation (pagine, filtrable)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiQuery({ name: 'status', required: false, enum: EmailStatus, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'priority', required: false, enum: EmailPriority, description: 'Filtrer par priorite' })
  @ApiQuery({ name: 'phaseOrder', required: false, type: Number, description: 'Filtrer par phase' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numero de page (defaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elements par page (defaut: 20)' })
  findAll(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Query('status') status?: EmailStatus,
    @Query('priority') priority?: EmailPriority,
    @Query('phaseOrder') phaseOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.simulatedEmailsService.findAll(simId, user.id, tenantId, {
      status,
      priority,
      phaseOrder: phaseOrder ? parseInt(phaseOrder, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // ─── Unread count ───────────────────────────────────────────

  @Get('simulations/:simId/emails/unread-count')
  @ApiOperation({ summary: 'Obtenir le nombre d\'emails non lus' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  getUnreadCount(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.getUnreadCount(
      simId,
      user.id,
      tenantId,
    );
  }

  // ─── Get single email (marks as read) ──────────────────────

  @Get('simulations/:simId/emails/:emailId')
  @ApiOperation({ summary: 'Obtenir un email (le marque comme lu)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'emailId', description: 'ID de l\'email' })
  findOne(
    @Param('simId') simId: string,
    @Param('emailId') emailId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.findOne(
      simId,
      emailId,
      user.id,
      tenantId,
    );
  }

  // ─── Respond to email ──────────────────────────────────────

  @Post('simulations/:simId/emails/:emailId/respond')
  @Auditable('EMAIL_RESPONDED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Repondre a un email (evaluation IA en arriere-plan)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'emailId', description: 'ID de l\'email' })
  respond(
    @Param('simId') simId: string,
    @Param('emailId') emailId: string,
    @Body() dto: RespondEmailDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.respond(
      simId,
      emailId,
      user.id,
      tenantId,
      dto,
    );
  }

  // ─── Archive email ──────────────────────────────────────────

  @Post('simulations/:simId/emails/:emailId/archive')
  @Auditable('EMAIL_ARCHIVED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Archiver un email' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'emailId', description: 'ID de l\'email' })
  archive(
    @Param('simId') simId: string,
    @Param('emailId') emailId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.archive(
      simId,
      emailId,
      user.id,
      tenantId,
    );
  }

  // ─── Generate phase emails ──────────────────────────────────

  @Post('simulations/:simId/emails/generate')
  @Auditable('EMAIL_BATCH_GENERATED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Generer les emails pour la phase courante ou specifiee' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  generate(
    @Param('simId') simId: string,
    @Body() dto: GenerateEmailsDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.generateForPhase(
      simId,
      user.id,
      tenantId,
      dto.phaseOrder,
    );
  }

  // ─── Generate welcome email ─────────────────────────────────

  @Post('simulations/:simId/emails/generate-welcome')
  @Auditable('EMAIL_GENERATED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Generer l\'email de bienvenue DRH' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  generateWelcome(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.generateWelcome(
      simId,
      user.id,
      tenantId,
    );
  }
}
