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
import { RespondEmailDto, GenerateEmailsDto, BulkEmailActionDto } from '../dto';

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
  @ApiOperation({ summary: 'Lister les emails d\'une simulation (paginé, filtrable)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiQuery({ name: 'status', required: false, enum: EmailStatus, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'priority', required: false, enum: EmailPriority, description: 'Filtrer par priorité' })
  @ApiQuery({ name: 'phaseOrder', required: false, type: Number, description: 'Filtrer par phase' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Éléments par page (défaut: 20)' })
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
  @ApiOperation({ summary: 'Répondre à un email (évaluation IA en arrière-plan)' })
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

  // ─── Bulk archive ───────────────────────────────────────────

  @Post('simulations/:simId/emails/bulk-archive')
  @Auditable('EMAIL_BULK_ARCHIVED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Archiver plusieurs emails en une seule opération' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  bulkArchive(
    @Param('simId') simId: string,
    @Body() dto: BulkEmailActionDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.bulkArchive(
      simId,
      user.id,
      tenantId,
      dto.emailIds,
    );
  }

  // ─── Bulk mark as read ──────────────────────────────────────

  @Post('simulations/:simId/emails/bulk-mark-read')
  @Auditable('EMAIL_BULK_MARKED_READ', 'SimulatedEmail')
  @ApiOperation({ summary: 'Marquer plusieurs emails comme lus en une seule opération' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  bulkMarkRead(
    @Param('simId') simId: string,
    @Body() dto: BulkEmailActionDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.bulkMarkRead(
      simId,
      user.id,
      tenantId,
      dto.emailIds,
    );
  }

  // ─── Mark single email as unread ────────────────────────────

  @Post('simulations/:simId/emails/:emailId/mark-unread')
  @Auditable('EMAIL_MARKED_UNREAD', 'SimulatedEmail')
  @ApiOperation({ summary: 'Marquer un email comme non lu' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'emailId', description: 'ID de l\'email' })
  markUnread(
    @Param('simId') simId: string,
    @Param('emailId') emailId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.markUnread(
      simId,
      emailId,
      user.id,
      tenantId,
    );
  }

  // ─── Generate phase emails ──────────────────────────────────

  @Post('simulations/:simId/emails/generate')
  @Auditable('EMAIL_BATCH_GENERATED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Générer les emails pour la phase courante ou spécifiée' })
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

  // ─── Generate simultaneous emails (US-5.6) ─────────────────

  @Post('simulations/:simId/emails/generate-simultaneous')
  @Auditable('EMAIL_BATCH_GENERATED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Générer des emails simultanés avec priorités différentes (test de priorisation)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  generateSimultaneous(
    @Param('simId') simId: string,
    @Body() dto: GenerateEmailsDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.generateSimultaneousEmails(
      simId,
      dto.phaseOrder ?? 0,
      user.id,
      tenantId,
    );
  }

  // ─── Generate change request email (US-5.8) ───────────────

  @Post('simulations/:simId/emails/generate-change-request')
  @Auditable('EMAIL_GENERATED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Générer un email de demande de changement du client' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  generateChangeRequest(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulatedEmailsService.generateChangeRequest(
      simId,
      user.id,
      tenantId,
    );
  }

  // ─── Generate welcome email ─────────────────────────────────

  @Post('simulations/:simId/emails/generate-welcome')
  @Auditable('EMAIL_GENERATED', 'SimulatedEmail')
  @ApiOperation({ summary: 'Générer l\'email de bienvenue DRH' })
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
