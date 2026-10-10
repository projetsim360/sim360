import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { AiService } from '../../ai/ai.service';

export interface CvSuggestions {
  experienceLines: string[];
  skillsToHighlight: string[];
  firstCvDraft?: string;
}

@Injectable()
export class CvSuggestionService {
  private readonly logger = new Logger(CvSuggestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async getOrGenerateSuggestions(simulationId: string, userId: string, tenantId: string) {
    // Verify simulation ownership
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { id: true, userId: true, tenantId: true },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Accès refusé');
    if (simulation.tenantId !== tenantId) throw new ForbiddenException('Accès refusé');

    // Check if CV suggestions already exist in the badge
    const existingBadge = await this.prisma.competencyBadge.findFirst({
      where: { simulationId, userId },
    });

    if (existingBadge?.cvSuggestions) {
      return { badgeId: existingBadge.id, cvSuggestions: existingBadge.cvSuggestions };
    }

    if (!existingBadge) {
      throw new NotFoundException(
        'Aucun badge trouvé pour cette simulation. Générez d\'abord le debriefing.',
      );
    }

    return this.generateSuggestions(simulationId, userId, tenantId, existingBadge);
  }

  private async generateSuggestions(
    simulationId: string,
    userId: string,
    tenantId: string,
    badge: any,
  ) {
    // Fetch user profile for context
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { profileType: true, diagnosticData: true },
    });

    // Fetch simulation data for context
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        scenario: { select: { title: true, sector: true, difficulty: true, description: true } },
        kpis: true,
        userDeliverables: {
          where: { status: { in: ['VALIDATED', 'EVALUATED'] } },
          select: { title: true, type: true },
        },
      },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');

    const prompt = this.buildPrompt(simulation, badge, userProfile);

    const aiResult = await this.aiService.complete({
      prompt,
      systemPrompt: this.getSystemPrompt(userProfile?.profileType),
      maxTokens: 2048,
      temperature: 0.6,
      trackingContext: {
        tenantId,
        userId,
        simulationId,
        operation: 'cv_suggestions_generation',
      },
    });

    const suggestions = this.parseSuggestions(aiResult.content);

    // Store in badge
    const updated = await this.prisma.competencyBadge.update({
      where: { id: badge.id },
      data: { cvSuggestions: suggestions as any },
    });

    await this.eventPublisher.publish(
      EventType.CV_SUGGESTIONS_GENERATED,
      AggregateType.COMPETENCY_BADGE,
      badge.id,
      { simulationId, badgeTitle: badge.title },
      {
        actorId: userId,
        actorType: 'user',
        tenantId,
        receiverIds: [userId],
        channels: ['socket'],
        priority: 1,
      },
    );

    return { badgeId: updated.id, cvSuggestions: suggestions };
  }

  private getSystemPrompt(profileType?: string | null): string {
    const isZeroExp = profileType === 'ZERO_EXPERIENCE';

    return `Tu es un coach carrière spécialisé en gestion de projet. Tu aides des apprenants à valoriser leur expérience de simulation sur leur CV. Réponds en français correct, avec les accents.

${isZeroExp ? `IMPORTANT : Cet apprenant n'a AUCUNE expérience professionnelle préalable. Tu dois :
- Générer une section "Expérience" complète basée sur la simulation
- Formuler les lignes comme une vraie expérience de stage/projet
- Mettre en avant les compétences transversales démontrées` : `Cet apprenant a déjà de l'expérience. Tu dois :
- Proposer des lignes à ajouter à la section "Expérience" existante
- Formuler les compétences de manière à compléter le profil existant`}

Tu dois répondre UNIQUEMENT en JSON valide, sans texte autour, avec exactement cette structure :
{
  "experienceLines": ["<3-5 lignes à ajouter à la section Expérience>"],
  "skillsToHighlight": ["<5-8 compétences à mettre en avant>"]${isZeroExp ? `,
  "firstCvDraft": "<section Expérience complète pour un premier CV, 100-200 mots>"` : ''}
}`;
  }

  private buildPrompt(simulation: any, badge: any, profile: any): string {
    const sections: string[] = [];

    sections.push(`## Contexte de la simulation`);
    sections.push(`Scénario: ${simulation.scenario.title}`);
    sections.push(`Secteur: ${simulation.scenario.sector} | Difficulté: ${simulation.scenario.difficulty}`);
    if (simulation.scenario.description) {
      sections.push(`Description: ${simulation.scenario.description}`);
    }

    sections.push(`\n## Résultats`);
    sections.push(`Score global: ${badge.globalScore}/100`);
    if (badge.competencyScores) {
      const scores = badge.competencyScores as Record<string, number>;
      Object.entries(scores).forEach(([key, value]) => {
        sections.push(`- ${key}: ${value}/100`);
      });
    }

    if (badge.strengths?.length) {
      sections.push(`\n## Points forts identifiés`);
      badge.strengths.forEach((s: string) => sections.push(`- ${s}`));
    }

    if (simulation.kpis) {
      sections.push(`\n## KPIs finaux`);
      sections.push(`Budget: ${simulation.kpis.budget}/100, Délai: ${simulation.kpis.schedule}/100, Qualité: ${simulation.kpis.quality}/100`);
    }

    if (simulation.userDeliverables?.length) {
      sections.push(`\n## Livrables produits`);
      simulation.userDeliverables.forEach((d: any) => {
        sections.push(`- ${d.title} (${d.type})`);
      });
    }

    if (profile?.profileType) {
      sections.push(`\n## Profil apprenant: ${profile.profileType}`);
    }

    return sections.join('\n');
  }

  private parseSuggestions(content: string): CvSuggestions {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        experienceLines: Array.isArray(parsed.experienceLines) ? parsed.experienceLines : [],
        skillsToHighlight: Array.isArray(parsed.skillsToHighlight) ? parsed.skillsToHighlight : [],
        firstCvDraft: parsed.firstCvDraft ?? undefined,
      };
    } catch (error: any) {
      this.logger.error(`Failed to parse CV suggestions: ${error.message}`);
      return {
        experienceLines: ['Gestion de projet simulée — compétences en planification, communication et gestion des risques'],
        skillsToHighlight: ['Gestion de projet', 'Planification', 'Communication', 'Gestion des risques'],
      };
    }
  }
}
