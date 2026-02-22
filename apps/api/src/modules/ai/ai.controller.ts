import { Controller, Post, Body, UseGuards, Sse, Req, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { AiService } from './ai.service';
import { AiOrchestratorService } from './services';
import { MeetingRespondDto, MeetingSummaryDto, DecisionEvaluateDto, SimulationReportDto } from './dto';
import { JwtAuthGuard, CurrentUser, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { SimulationsService } from '../simulations/services/simulations.service';
import { KpiEngineService } from '../simulations/services/kpi-engine.service';

interface MessageEvent {
  data: string;
}

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private aiService: AiService,
    private orchestrator: AiOrchestratorService,
    private simulationsService: SimulationsService,
    private kpiEngine: KpiEngineService,
    private eventPublisher: EventPublisherService,
  ) {}

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

  @Sse('meeting/respond')
  @ApiOperation({ summary: 'AI participant response (SSE streaming)' })
  async meetingRespond(
    @Body() dto: MeetingRespondDto,
    @CurrentUser() user: any,
  ): Promise<Observable<MessageEvent>> {
    const simulation = await this.simulationsService.findOne(dto.simulationId, user.id);
    const participant = simulation.project.teamMembers.find(
      (m) => m.name.toLowerCase() === dto.participantName.toLowerCase(),
    );

    if (!participant) {
      throw new NotFoundException(`Participant "${dto.participantName}" introuvable`);
    }

    const currentPhase = simulation.phases.find((p) => p.order === simulation.currentPhaseOrder);
    const kpis = simulation.kpis!;

    const context = {
      scenarioTitle: simulation.scenario.title,
      phaseName: currentPhase?.name ?? 'Inconnue',
      kpis: {
        budget: kpis.budget,
        schedule: kpis.schedule,
        quality: kpis.quality,
        teamMorale: kpis.teamMorale,
        riskLevel: kpis.riskLevel,
      },
      projectDescription: simulation.project.description ?? undefined,
    };

    const participantCtx = {
      name: participant.name,
      role: participant.role,
      personality: participant.personality,
      expertise: participant.expertise,
      morale: participant.morale,
    };

    // Publish event
    this.eventPublisher.publish(
      EventType.AI_MEETING_RESPONSE,
      AggregateType.SIMULATION,
      dto.simulationId,
      { participant: participant.name, message: dto.userMessage },
      { actorId: user.id, actorType: 'user', tenantId: user.tenantId, channels: ['socket'] },
    );

    return this.orchestrator.meeting.streamResponse(
      participantCtx,
      context,
      dto.history ?? [],
      dto.userMessage,
    );
  }

  @Post('meeting/summary')
  @ApiOperation({ summary: 'Generate meeting summary' })
  async meetingSummary(
    @Body() dto: MeetingSummaryDto,
    @CurrentUser() user: any,
  ) {
    const simulation = await this.simulationsService.findOne(dto.simulationId, user.id);
    const kpis = simulation.kpis!;

    const summary = await this.orchestrator.meeting.generateSummary(
      dto.meetingTitle,
      dto.history,
      {
        budget: kpis.budget,
        schedule: kpis.schedule,
        quality: kpis.quality,
        teamMorale: kpis.teamMorale,
        riskLevel: kpis.riskLevel,
      },
    );

    return { summary };
  }

  @Post('decision/evaluate')
  @ApiOperation({ summary: 'Evaluate a decision with AI coaching' })
  async decisionEvaluate(
    @Body() dto: DecisionEvaluateDto,
    @CurrentUser() user: any,
  ) {
    const simulation = await this.simulationsService.findOne(dto.simulationId, user.id);
    const decision = simulation.decisions.find((d) => d.id === dto.decisionId);

    if (!decision) {
      throw new NotFoundException('Decision introuvable');
    }

    const currentPhase = simulation.phases.find((p) => p.order === decision.phaseOrder);
    const kpis = simulation.kpis!;

    // Build decision history for pattern detection
    const pastDecisions = simulation.decisions
      .filter((d) => d.selectedOption !== null && d.id !== decision.id)
      .map((d) => {
        const opts = d.options as Array<{ kpiImpact?: Record<string, number> }>;
        const selectedImpact = opts[d.selectedOption!]?.kpiImpact ?? {};
        let bestIdx = 0;
        let bestScore = -Infinity;
        for (let i = 0; i < opts.length; i++) {
          const imp = opts[i].kpiImpact ?? {};
          const sc = (imp.budget ?? 0) * 0.25 + (imp.schedule ?? 0) * 0.25 + (imp.quality ?? 0) * 0.25 + (imp.teamMorale ?? 0) * 0.15 - (imp.riskLevel ?? 0) * 0.10;
          if (sc > bestScore) { bestScore = sc; bestIdx = i; }
        }
        return { selectedOption: d.selectedOption!, optimalOption: bestIdx, kpiImpact: selectedImpact };
      });

    const result = await this.orchestrator.decision.evaluateDecision({
      title: decision.title,
      context: decision.context,
      options: decision.options as any[],
      selectedOption: dto.selectedOption,
      scenarioTitle: simulation.scenario.title,
      phaseName: currentPhase?.name ?? 'Inconnue',
      kpis: {
        budget: kpis.budget,
        schedule: kpis.schedule,
        quality: kpis.quality,
        teamMorale: kpis.teamMorale,
        riskLevel: kpis.riskLevel,
      },
      decisionHistory: pastDecisions,
    });

    // Publish event
    await this.eventPublisher.publish(
      EventType.AI_DECISION_EVALUATED,
      AggregateType.DECISION,
      dto.decisionId,
      { simulationId: dto.simulationId, selectedOption: dto.selectedOption },
      { actorId: user.id, actorType: 'user', tenantId: user.tenantId, channels: ['socket'] },
    );

    return result;
  }

  @Post('simulation/report')
  @ApiOperation({ summary: 'Generate phase or final simulation report' })
  async simulationReport(
    @Body() dto: SimulationReportDto,
    @CurrentUser() user: any,
  ) {
    const simulation = await this.simulationsService.findOne(dto.simulationId, user.id);
    const kpis = simulation.kpis!;
    const kpiValues = {
      budget: kpis.budget,
      schedule: kpis.schedule,
      quality: kpis.quality,
      teamMorale: kpis.teamMorale,
      riskLevel: kpis.riskLevel,
    };

    let report: string;

    if (dto.type === 'phase') {
      const phaseOrder = dto.phaseOrder ?? simulation.currentPhaseOrder;
      const phase = simulation.phases.find((p) => p.order === phaseOrder);
      if (!phase) throw new BadRequestException('Phase introuvable');

      const phaseDecisions = simulation.decisions
        .filter((d) => d.phaseOrder === phaseOrder && d.selectedOption !== null)
        .map((d) => ({
          title: d.title,
          selectedOption: d.selectedOption!,
          options: d.options as any[],
          kpiImpact: d.kpiImpact,
        }));

      report = await this.orchestrator.feedback.generatePhaseReport(
        { name: phase.name, order: phase.order },
        phaseDecisions,
        kpiValues, // approximation — before = current for simplicity
        kpiValues,
      );
    } else {
      const finalScore = this.kpiEngine.calculateFinalScore(kpiValues);
      const allDecisions = simulation.decisions
        .filter((d) => d.selectedOption !== null)
        .map((d) => ({
          title: d.title,
          selectedOption: d.selectedOption!,
          options: d.options as any[],
          kpiImpact: d.kpiImpact,
          phaseOrder: d.phaseOrder,
        }));

      report = await this.orchestrator.feedback.generateFinalReport(
        simulation.scenario.title,
        kpiValues,
        finalScore,
        allDecisions,
        simulation.phases.map((p) => ({ name: p.name, order: p.order })),
      );
    }

    // Publish event
    await this.eventPublisher.publish(
      EventType.AI_REPORT_GENERATED,
      AggregateType.SIMULATION,
      dto.simulationId,
      { type: dto.type, phaseOrder: dto.phaseOrder },
      { actorId: user.id, actorType: 'user', tenantId: user.tenantId, channels: ['socket'] },
    );

    return { report };
  }
}
