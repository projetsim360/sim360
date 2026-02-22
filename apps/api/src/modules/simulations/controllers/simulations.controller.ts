import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Auditable } from '@sim360/core';
import { SimulationStatus } from '@prisma/client';
import { SimulationsService } from '../services/simulations.service';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { MakeDecisionDto } from '../dto/make-decision.dto';
import { RespondEventDto } from '../dto/respond-event.dto';

@ApiTags('Simulations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('simulations')
export class SimulationsController {
  constructor(private simulationsService: SimulationsService) {}

  @Post()
  @Auditable('simulation.create', 'Simulation')
  @ApiOperation({ summary: 'Lancer une simulation a partir d\'un scenario' })
  create(
    @Body() dto: CreateSimulationDto,
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.simulationsService.create(userId, tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Mes simulations' })
  @ApiQuery({ name: 'status', enum: SimulationStatus, required: false })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
    @Query('status') status?: SimulationStatus,
  ) {
    return this.simulationsService.findAll(userId, tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'une simulation' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.simulationsService.findOne(id, userId);
  }

  @Patch(':id/pause')
  @Auditable('simulation.pause', 'Simulation')
  @ApiOperation({ summary: 'Mettre en pause' })
  pause(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.simulationsService.pause(id, userId);
  }

  @Patch(':id/resume')
  @Auditable('simulation.resume', 'Simulation')
  @ApiOperation({ summary: 'Reprendre la simulation' })
  resume(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.simulationsService.resume(id, userId);
  }

  @Post(':id/advance-phase')
  @Auditable('simulation.advance-phase', 'Simulation')
  @ApiOperation({ summary: 'Avancer a la phase suivante' })
  advancePhase(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.simulationsService.advancePhase(id, userId);
  }

  @Post(':id/decisions/:decId/choose')
  @Auditable('decision.make', 'Decision')
  @ApiOperation({ summary: 'Prendre une decision' })
  makeDecision(
    @Param('id') simId: string,
    @Param('decId') decId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: MakeDecisionDto,
  ) {
    return this.simulationsService.makeDecision(simId, decId, userId, dto);
  }

  @Post(':id/events/:evtId/respond')
  @Auditable('event.respond', 'RandomEvent')
  @ApiOperation({ summary: 'Reagir a un evenement aleatoire' })
  respondToEvent(
    @Param('id') simId: string,
    @Param('evtId') evtId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RespondEventDto,
  ) {
    return this.simulationsService.respondToEvent(simId, evtId, userId, dto);
  }

  @Get(':id/kpis')
  @ApiOperation({ summary: 'KPIs actuels de la simulation' })
  getKpis(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.simulationsService.getKpis(id, userId);
  }

  @Get(':id/kpis/history')
  @ApiOperation({ summary: 'Historique des snapshots KPI' })
  getKpiHistory(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.simulationsService.getKpiHistory(id, userId);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Timeline des actions' })
  getTimeline(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.simulationsService.getTimeline(id, userId);
  }
}
