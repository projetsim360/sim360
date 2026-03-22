import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import { AiService } from '@/modules/ai/ai.service';

export interface SuggestedStakeholder {
  name: string;
  role: string;
  expertise: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR';
  personality: 'COOPERATIVE' | 'NEUTRAL' | 'RESISTANT';
  morale: number;
  rationale: string;
}

@Injectable()
export class StakeholderIdentificationService {
  private readonly logger = new Logger(StakeholderIdentificationService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  /**
   * Suggest stakeholders based on the project charter content.
   * Called after the user writes their own charter in a Greenfield scenario.
   */
  async suggestStakeholders(
    simulationId: string,
    userId: string,
    tenantId: string,
    charterContent?: string,
  ): Promise<SuggestedStakeholder[]> {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        project: { select: { name: true, description: true, sector: true } },
        scenario: { select: { title: true, sector: true, difficulty: true } },
      },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');

    const projectContext = [
      `Projet : ${simulation.project?.name ?? simulation.scenario.title}`,
      `Secteur : ${simulation.project?.sector ?? simulation.scenario.sector}`,
      `Description : ${simulation.project?.description ?? ''}`,
      `Difficulte : ${simulation.scenario.difficulty}`,
    ].join('\n');

    const prompt = [
      `Tu es un expert en gestion de projet PMI/PMBOK.`,
      `A partir du contexte suivant, identifie les parties prenantes cles necessaires au projet.`,
      ``,
      projectContext,
      charterContent ? `\nCharte de projet redigee par l'apprenant :\n${charterContent}` : '',
      ``,
      `Genere une equipe de 5 a 7 membres avec des profils realistes.`,
      `Inclus au minimum : 1 Sponsor/Directeur, 1 Expert technique senior, 1-2 developpeurs/executants, 1 QA/testeur, 1 utilisateur cle.`,
      ``,
      `Reponds en JSON strict (array) :`,
      `[{"name": "Prenom Nom", "role": "Titre du poste", "expertise": "JUNIOR|INTERMEDIATE|SENIOR", "personality": "COOPERATIVE|NEUTRAL|RESISTANT", "morale": 50-90, "rationale": "Pourquoi cette personne est necessaire (1 phrase)"}]`,
      ``,
      `Utilise des noms francais realistes. Varie les personnalites selon la difficulte (${simulation.scenario.difficulty}).`,
    ].filter(Boolean).join('\n');

    const result = await this.aiService.complete({
      prompt,
      maxTokens: 1500,
      temperature: 0.7,
      trackingContext: { tenantId, userId, simulationId, operation: 'stakeholder_identification' },
    });

    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      return JSON.parse(jsonMatch[0]) as SuggestedStakeholder[];
    } catch {
      this.logger.error('Failed to parse stakeholder suggestions');
      return [];
    }
  }

  /**
   * Apply suggested stakeholders to the project (create team members).
   */
  async applyStakeholders(
    simulationId: string,
    userId: string,
    stakeholders: Array<{ name: string; role: string; expertise: string; personality: string; morale?: number }>,
  ) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { projectId: true, userId: true },
    });

    if (!simulation || simulation.userId !== userId) {
      throw new NotFoundException('Simulation introuvable');
    }

    const created = await this.prisma.projectTeamMember.createMany({
      data: stakeholders.map((s, index) => ({
        projectId: simulation.projectId,
        name: s.name,
        role: s.role,
        expertise: s.expertise || 'INTERMEDIATE',
        personality: s.personality || 'COOPERATIVE',
        morale: s.morale ?? 75,
        avatar: `/media/avatars/300-${(index % 36) + 1}.png`,
      })),
    });

    this.logger.log(`Applied ${created.count} stakeholders to project ${simulation.projectId}`);
    return { count: created.count };
  }
}
