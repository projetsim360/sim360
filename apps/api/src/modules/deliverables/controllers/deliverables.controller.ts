import {
  Controller,
  Get,
  Post,
  Patch,
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
import { UserDeliverableStatus } from '@prisma/client';
import { DeliverablesService } from '../services/deliverables.service';
import {
  CreateDeliverableDto,
  UpdateDeliverableContentDto,
} from '../dto';

@ApiTags('Deliverables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  // ─── US-4.3: List deliverables ────────────────────────────

  @Get('simulations/:simId/deliverables')
  @ApiOperation({ summary: 'Lister les livrables d\'une simulation' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiQuery({ name: 'phase', required: false, type: Number, description: 'Filtrer par ordre de phase' })
  @ApiQuery({ name: 'status', required: false, enum: UserDeliverableStatus, description: 'Filtrer par statut' })
  findAll(
    @Param('simId') simId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Query('phase') phase?: string,
    @Query('status') status?: UserDeliverableStatus,
  ) {
    return this.deliverablesService.findAll(simId, user.id, tenantId, {
      phase: phase ? parseInt(phase, 10) : undefined,
      status,
    });
  }

  // ─── US-4.1: Create deliverable ──────────────────────────

  @Post('simulations/:simId/deliverables')
  @Auditable('DELIVERABLE_CREATE', 'UserDeliverable')
  @ApiOperation({ summary: 'Creer un nouveau livrable (brouillon)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  create(
    @Param('simId') simId: string,
    @Body() dto: CreateDeliverableDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.create(simId, user.id, tenantId, dto);
  }

  // ─── US-4.3: Get single deliverable ──────────────────────

  @Get('simulations/:simId/deliverables/:id')
  @ApiOperation({ summary: 'Obtenir un livrable par ID' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'id', description: 'ID du livrable' })
  findOne(
    @Param('simId') simId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.findOne(simId, id, user.id, tenantId);
  }

  // ─── US-4.1: Auto-save content ───────────────────────────

  @Patch('simulations/:simId/deliverables/:id/content')
  @ApiOperation({ summary: 'Sauvegarder le contenu du livrable (auto-save)' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'id', description: 'ID du livrable' })
  updateContent(
    @Param('simId') simId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDeliverableContentDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.updateContent(
      simId,
      id,
      user.id,
      tenantId,
      dto,
    );
  }

  // ─── US-4.2: Submit for evaluation ────────────────────────

  @Post('simulations/:simId/deliverables/:id/submit')
  @Auditable('DELIVERABLE_SUBMIT', 'UserDeliverable')
  @ApiOperation({ summary: 'Soumettre le livrable pour evaluation IA' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'id', description: 'ID du livrable' })
  submit(
    @Param('simId') simId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.submit(simId, id, user.id, tenantId);
  }

  // ─── US-4.4: Get template ────────────────────────────────

  @Get('simulations/:simId/deliverables/:id/template')
  @ApiOperation({ summary: 'Obtenir le template associe au livrable' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'id', description: 'ID du livrable' })
  getTemplate(
    @Param('simId') simId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.getTemplate(simId, id, user.id, tenantId);
  }

  // ─── US-4.5: Get evaluation ───────────────────────────────

  @Get('simulations/:simId/deliverables/:id/evaluation')
  @ApiOperation({ summary: 'Obtenir la derniere evaluation du livrable' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'id', description: 'ID du livrable' })
  getEvaluation(
    @Param('simId') simId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.getEvaluation(
      simId,
      id,
      user.id,
      tenantId,
    );
  }

  // ─── US-4.6: Get reference example ────────────────────────

  @Get('simulations/:simId/deliverables/:id/reference')
  @ApiOperation({
    summary: 'Obtenir l\'exemple de reference (uniquement apres evaluation)',
  })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'id', description: 'ID du livrable' })
  getReferenceExample(
    @Param('simId') simId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.getReferenceExample(
      simId,
      id,
      user.id,
      tenantId,
    );
  }

  // ─── US-4.8: Revise deliverable ──────────────────────────

  @Post('simulations/:simId/deliverables/:id/revise')
  @Auditable('DELIVERABLE_REVISE', 'UserDeliverable')
  @ApiOperation({ summary: 'Remettre un livrable evalue en mode revision' })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'id', description: 'ID du livrable' })
  revise(
    @Param('simId') simId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.revise(simId, id, user.id, tenantId);
  }

  // ─── US-4.9 + US-4.10: Meeting minutes ───────────────────

  @Post('simulations/:simId/meetings/:meetingId/create-minutes')
  @Auditable('DELIVERABLE_CREATE_MINUTES', 'UserDeliverable')
  @ApiOperation({
    summary: 'Creer un livrable compte-rendu pre-rempli pour une reunion',
  })
  @ApiParam({ name: 'simId', description: 'ID de la simulation' })
  @ApiParam({ name: 'meetingId', description: 'ID de la reunion' })
  createMeetingMinutes(
    @Param('simId') simId: string,
    @Param('meetingId') meetingId: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.deliverablesService.createMeetingMinutes(
      simId,
      meetingId,
      user.id,
      tenantId,
    );
  }
}
