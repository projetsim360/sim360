import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { AiService } from '../../ai/ai.service';

interface CompetencyScores {
  planification: number;
  communication: number;
  risques: number;
  leadership: number;
  rigueur: number;
  adaptabilite: number;
}

interface DebriefingResult {
  globalScore: number;
  competencyScores: CompetencyScores;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  summary: string;
}

@Injectable()
export class DebriefingService {
  private readonly logger = new Logger(DebriefingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async getOrGenerateDebriefing(simulationId: string, userId: string, tenantId: string, force = false) {
    // Verify simulation ownership
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { id: true, userId: true, tenantId: true, status: true },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');
    if (simulation.tenantId !== tenantId) throw new ForbiddenException('Acces refuse');

    // Check if badge already exists for this simulation
    if (!force) {
      const existing = await this.prisma.competencyBadge.findFirst({
        where: { simulationId, userId, tenantId },
      });
      if (existing) return existing;
    }

    return this.generateDebriefing(simulationId, userId, tenantId);
  }

  async generateDebriefing(simulationId: string, userId: string, tenantId: string) {
    // Fetch all simulation data
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        scenario: { select: { title: true, sector: true, difficulty: true, description: true } },
        kpis: true,
        phases: { orderBy: { order: 'asc' } },
        decisions: {
          orderBy: { phaseOrder: 'asc' },
          select: {
            title: true,
            selectedOption: true,
            options: true,
            phaseOrder: true,
          },
        },
        randomEvents: {
          orderBy: { phaseOrder: 'asc' },
          select: {
            title: true,
            selectedOption: true,
            severity: true,
            resolvedAt: true,
            phaseOrder: true,
          },
        },
        meetings: {
          include: {
            summary: true,
            _count: { select: { messages: true } },
          },
        },
        userDeliverables: {
          include: {
            evaluations: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        simulatedEmails: {
          where: { status: 'RESPONDED' },
          select: {
            subject: true,
            responseScore: true,
            responseFeedback: true,
          },
        },
      },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');

    const sim = simulation as any;

    // Calculate duration
    const durationMinutes = sim.startedAt && sim.completedAt
      ? Math.round((sim.completedAt.getTime() - sim.startedAt.getTime()) / 60000)
      : sim.totalDurationMinutes ?? null;

    // Build AI prompt with all simulation data
    const prompt = this.buildDebriefingPrompt(sim);

    const aiResult = await this.aiService.complete({
      prompt,
      systemPrompt: this.getSystemPrompt(),
      maxTokens: 4096,
      temperature: 0.6,
      trackingContext: {
        tenantId,
        userId,
        simulationId,
        operation: 'debriefing_generation',
      },
    });

    // Parse AI response
    const debriefing = this.parseDebriefingResponse(aiResult.content);

    // Delete existing badge if any (for regeneration)
    await this.prisma.competencyBadge.deleteMany({
      where: { simulationId, userId },
    });

    // Create competency badge
    const badge = await this.prisma.competencyBadge.create({
      data: {
        userId,
        simulationId,
        tenantId,
        title: `Badge - ${sim.scenario.title}`,
        description: `Certification de competences en gestion de projet pour le scenario "${sim.scenario.title}"`,
        scenarioTitle: sim.scenario.title,
        sector: sim.scenario.sector,
        difficulty: sim.scenario.difficulty,
        globalScore: debriefing.globalScore,
        competencyScores: debriefing.competencyScores as any,
        strengths: debriefing.strengths,
        improvements: debriefing.improvements,
        recommendations: debriefing.recommendations,
        debriefingSummary: debriefing.summary,
        durationMinutes,
      },
    });

    // Publish events
    await this.eventPublisher.publish(
      EventType.DEBRIEFING_GENERATED,
      AggregateType.COMPETENCY_BADGE,
      badge.id,
      { simulationId, scenarioTitle: sim.scenario.title, globalScore: debriefing.globalScore },
      {
        actorId: userId,
        actorType: 'user',
        tenantId,
        receiverIds: [userId],
        channels: ['socket'],
        priority: 2,
      },
    );

    await this.eventPublisher.publish(
      EventType.BADGE_GENERATED,
      AggregateType.COMPETENCY_BADGE,
      badge.id,
      { simulationId, title: badge.title, globalScore: debriefing.globalScore },
      {
        actorId: userId,
        actorType: 'user',
        tenantId,
        receiverIds: [userId],
        channels: ['socket'],
        priority: 2,
      },
    );

    return badge;
  }

  private getSystemPrompt(): string {
    return `Tu es un PMO senior (directeur de bureau de projets) avec 20 ans d'experience. Tu debriefes un apprenant qui vient de terminer une simulation de gestion de projet.

Ton style :
- Direct et honnete, comme un vrai mentor PMO
- Tu utilises des exemples concrets tires de la simulation
- Tu ne flattes pas inutilement, mais tu reconnais les vrais points forts
- Tu donnes des conseils actionnable et specifiques
- Tu tutoies l'apprenant

Exemples de ton :
- "Tu es excellent en planification, mais tu perds tes moyens en reunion de crise."
- "Tu as gere avec succes un conflit fournisseur et un depassement budgetaire de 15%"
- "Ta gestion des risques est approximative — tu reagis au lieu d'anticiper."

Tu dois repondre UNIQUEMENT en JSON valide, sans texte autour, avec exactement cette structure :
{
  "globalScore": <number 0-100>,
  "competencyScores": {
    "planification": <number 0-100>,
    "communication": <number 0-100>,
    "risques": <number 0-100>,
    "leadership": <number 0-100>,
    "rigueur": <number 0-100>,
    "adaptabilite": <number 0-100>
  },
  "strengths": ["<3-5 points forts specifiques>"],
  "improvements": ["<3-5 axes d'amelioration specifiques>"],
  "recommendations": ["<3-5 recommandations concretes>"],
  "summary": "<paragraphe de debriefing direct et personnalise, 150-300 mots>"
}`;
  }

  private buildDebriefingPrompt(simulation: any): string {
    const kpis = simulation.kpis;
    const decisions = simulation.decisions ?? [];
    const events = simulation.randomEvents ?? [];
    const meetings = simulation.meetings ?? [];
    const deliverables = simulation.userDeliverables ?? [];
    const emails = simulation.simulatedEmails ?? [];

    const sections: string[] = [];

    sections.push(`## Scenario: ${simulation.scenario.title}`);
    sections.push(`Secteur: ${simulation.scenario.sector} | Difficulte: ${simulation.scenario.difficulty}`);
    if (simulation.scenario.description) {
      sections.push(`Description: ${simulation.scenario.description}`);
    }

    // KPIs finaux
    if (kpis) {
      sections.push(`\n## KPIs Finaux`);
      sections.push(`- Budget: ${kpis.budget}/100`);
      sections.push(`- Delai: ${kpis.schedule}/100`);
      sections.push(`- Qualite: ${kpis.quality}/100`);
      sections.push(`- Moral equipe: ${kpis.teamMorale}/100`);
      sections.push(`- Niveau de risque: ${kpis.riskLevel}/100`);
    }

    // Phases
    if (simulation.phases?.length) {
      sections.push(`\n## Phases traversees: ${simulation.phases.length}`);
      simulation.phases.forEach((p: any) => {
        sections.push(`- Phase ${p.order}: ${p.name} (${p.status})`);
      });
    }

    // Decisions
    if (decisions.length) {
      sections.push(`\n## Decisions prises: ${decisions.length}`);
      decisions.forEach((d: any) => {
        sections.push(`- [Phase ${d.phaseOrder}] ${d.title}: choix "${d.chosenOptionTitle ?? 'non specifie'}"`);
        if (d.aiFeedback) sections.push(`  Feedback IA: ${d.aiFeedback.substring(0, 200)}`);
      });
    }

    // Random events
    if (events.length) {
      sections.push(`\n## Evenements aleatoires: ${events.length}`);
      events.forEach((e: any) => {
        sections.push(`- [Phase ${e.phaseOrder}] ${e.title}: reponse "${e.chosenOptionTitle ?? 'non specifie'}"`);
        if (e.aiFeedback) sections.push(`  Feedback IA: ${e.aiFeedback.substring(0, 200)}`);
      });
    }

    // Meetings
    if (meetings.length) {
      sections.push(`\n## Reunions: ${meetings.length}`);
      meetings.forEach((m: any) => {
        const msgCount = m._count?.messages ?? 0;
        sections.push(`- ${m.title} (${m.status}, ${msgCount} messages)`);
        if (m.summary) {
          sections.push(`  Resume: ${m.summary.summary?.substring(0, 200) ?? ''}`);
          if (m.summary.keyDecisions?.length) {
            sections.push(`  Decisions cles: ${m.summary.keyDecisions.join(', ')}`);
          }
        }
      });
    }

    // Deliverables
    if (deliverables.length) {
      sections.push(`\n## Livrables: ${deliverables.length}`);
      deliverables.forEach((d: any) => {
        const lastEval = d.evaluations?.[0];
        const scoreStr = lastEval ? `${lastEval.grade} (${lastEval.score}/100)` : 'non evalue';
        sections.push(`- ${d.title} (${d.type}, ${d.status}) — Score: ${scoreStr}, ${d.revisionNumber} revision(s)`);
      });
    }

    // Emails
    if (emails.length) {
      sections.push(`\n## Emails traites: ${emails.length}`);
      const avgScore = emails.reduce((sum: number, e: any) => sum + (e.responseScore ?? 0), 0) / emails.length;
      sections.push(`Score moyen des reponses: ${avgScore.toFixed(0)}/100`);
    }

    return sections.join('\n');
  }

  private parseDebriefingResponse(content: string): DebriefingResult {
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        globalScore: this.clamp(parsed.globalScore ?? 50, 0, 100),
        competencyScores: {
          planification: this.clamp(parsed.competencyScores?.planification ?? 50, 0, 100),
          communication: this.clamp(parsed.competencyScores?.communication ?? 50, 0, 100),
          risques: this.clamp(parsed.competencyScores?.risques ?? 50, 0, 100),
          leadership: this.clamp(parsed.competencyScores?.leadership ?? 50, 0, 100),
          rigueur: this.clamp(parsed.competencyScores?.rigueur ?? 50, 0, 100),
          adaptabilite: this.clamp(parsed.competencyScores?.adaptabilite ?? 50, 0, 100),
        },
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : [],
        summary: parsed.summary ?? 'Debriefing non disponible.',
      };
    } catch (error: any) {
      this.logger.error(`Failed to parse debriefing response: ${error.message}`);
      this.logger.debug(`Raw content: ${content.substring(0, 500)}`);

      return {
        globalScore: 50,
        competencyScores: {
          planification: 50,
          communication: 50,
          risques: 50,
          leadership: 50,
          rigueur: 50,
          adaptabilite: 50,
        },
        strengths: ['Donnees insuffisantes pour generer un debriefing detaille'],
        improvements: ['Completez davantage la simulation pour un debriefing precis'],
        recommendations: ['Refaites la simulation en completant toutes les phases'],
        summary: 'Le debriefing n\'a pas pu etre genere automatiquement. Veuillez reessayer.',
      };
    }
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(value)));
  }
}
