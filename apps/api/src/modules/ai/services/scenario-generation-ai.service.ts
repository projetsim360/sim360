import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai.service';
import { PrismaService } from '@sim360/core';
import { Prisma, PhaseType } from '@prisma/client';

export interface GenerateScenarioInput {
  // From profile
  profileType?: string; // ZERO_EXPERIENCE, BEGINNER, RECONVERSION, REINFORCEMENT
  sector?: string;
  skills?: Array<{ name: string; currentLevel: number; targetLevel: number }>;

  // From custom project
  projectName?: string;
  projectDescription?: string;
  constraints?: string;
  learningObjectives?: string;

  // Direct params
  difficulty?: string; // BEGINNER, INTERMEDIATE, ADVANCED
  scenarioType?: string; // GREENFIELD, BROWNFIELD
}

export interface GeneratedScenario {
  title: string;
  description: string;
  objectives: string[];
  sector: string;
  difficulty: string;
  scenarioType: string;
  competencies: string[];
  estimatedDurationHours: number;
  projectTemplate: {
    name: string;
    client: string;
    sector: string;
    description: string;
    teamSize: number;
    initialBudget: number;
    deadlineDays: number;
    team: Array<{
      name: string;
      role: string;
      expertise: string;
      personality: string;
      morale: number;
    }>;
    deliverables: Array<{
      name: string;
      description: string;
      phaseOrder: number;
      type?: string;
    }>;
  };
  initialKpis: {
    budget: number;
    schedule: number;
    quality: number;
    teamMorale: number;
    riskLevel: number;
  };
  phases: Array<{
    name: string;
    type: string;
    durationDays: number;
    description: string;
    meetingTemplates: Array<{
      title: string;
      type: string;
      objectives: string[];
      durationMinutes: number;
      participants: Array<{
        name: string;
        role: string;
        personality: string;
        cooperationLevel: number;
      }>;
    }>;
    decisionTemplates: Array<{
      title: string;
      context: string;
      options: Array<{
        label: string;
        description: string;
        kpiImpact: Record<string, number>;
      }>;
    }>;
  }>;
}

@Injectable()
export class ScenarioGenerationAiService {
  private readonly logger = new Logger(ScenarioGenerationAiService.name);

  constructor(
    private aiService: AiService,
    private prisma: PrismaService,
  ) {}

  async generateScenario(
    input: GenerateScenarioInput,
    trackingContext?: { tenantId: string; userId: string; operation: string },
  ): Promise<GeneratedScenario> {
    // Map profileType to difficulty
    const difficulty =
      input.difficulty ?? this.mapProfileToDifficulty(input.profileType);
    const sector = input.sector ?? 'IT';
    const scenarioType = input.scenarioType ?? 'GREENFIELD';

    const prompt = this.buildPrompt(input, difficulty, sector, scenarioType);

    const result = await this.aiService.complete({
      systemPrompt: [
        'Tu es un expert en conception de scenarios de simulation de gestion de projet.',
        'Tu generes des scenarios realistes et pedagogiques pour former des chefs de projet.',
        'Tes scenarios sont alignes sur le referentiel PMBOK du PMI.',
        'Tu reponds UNIQUEMENT en JSON valide, sans commentaires ni markdown.',
      ].join('\n'),
      prompt,
      maxTokens: 8000,
      temperature: 0.7,
      trackingContext: trackingContext
        ? { ...trackingContext, operation: 'scenario_generation' }
        : undefined,
    });

    // Parse JSON response
    try {
      let jsonStr = result.content;
      // Extract JSON object
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      jsonStr = jsonMatch[0];

      // Try to repair truncated JSON by closing open brackets/braces
      let parsed: GeneratedScenario;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        this.logger.warn('JSON truncated, attempting repair...');
        // Count open/close brackets and braces
        let openBraces = 0;
        let openBrackets = 0;
        for (const ch of jsonStr) {
          if (ch === '{') openBraces++;
          else if (ch === '}') openBraces--;
          else if (ch === '[') openBrackets++;
          else if (ch === ']') openBrackets--;
        }
        // Trim trailing comma or incomplete value
        jsonStr = jsonStr.replace(/,\s*$/, '');
        jsonStr = jsonStr.replace(/,\s*"[^"]*"?\s*$/, '');
        // Close open structures
        while (openBrackets > 0) { jsonStr += ']'; openBrackets--; }
        while (openBraces > 0) { jsonStr += '}'; openBraces--; }
        parsed = JSON.parse(jsonStr);
      }

      // Ensure required fields
      parsed.sector = sector;
      parsed.difficulty = difficulty;
      parsed.scenarioType = scenarioType;
      parsed.phases = parsed.phases ?? [];
      parsed.competencies = parsed.competencies ?? [];
      parsed.objectives = parsed.objectives ?? [];

      return parsed;
    } catch (err) {
      this.logger.error(`Failed to parse AI scenario: ${err}`);
      throw new Error(
        'Impossible de generer le scenario. Veuillez reessayer.',
      );
    }
  }

  /**
   * Generate and persist a scenario in the database.
   */
  async generateAndSave(
    userId: string,
    input: GenerateScenarioInput,
    trackingContext?: {
      tenantId: string;
      userId: string;
      operation: string;
    },
  ) {
    const generated = await this.generateScenario(input, trackingContext);

    const scenario = await this.prisma.scenario.create({
      data: {
        title: generated.title,
        description: generated.description,
        objectives: generated.objectives,
        sector: generated.sector as any,
        difficulty: generated.difficulty as any,
        scenarioType: generated.scenarioType as any,
        estimatedDurationHours: generated.estimatedDurationHours ?? 4,
        competencies: generated.competencies ?? [],
        projectTemplate:
          generated.projectTemplate as unknown as Prisma.InputJsonValue,
        initialKpis:
          generated.initialKpis as unknown as Prisma.InputJsonValue,
        isPublished: true, // Auto-publish so the user can launch immediately
        createdById: userId,
        phases: {
          create: generated.phases.map((phase, index) => ({
            order: index,
            name: phase.name,
            type: phase.type as PhaseType,
            durationDays: phase.durationDays ?? 10,
            description: phase.description,
            completionCriteria: {} as any,
            meetingTemplates: phase.meetingTemplates?.length
              ? {
                  create: phase.meetingTemplates.map((m) => ({
                    title: m.title,
                    type: m.type ?? 'STEERING',
                    objectives: m.objectives ?? [],
                    durationMinutes: m.durationMinutes ?? 30,
                    participants:
                      m.participants as unknown as Prisma.InputJsonValue,
                  })),
                }
              : undefined,
            decisionTemplates: phase.decisionTemplates?.length
              ? {
                  create: phase.decisionTemplates.map((d) => ({
                    title: d.title,
                    context: d.context,
                    options:
                      d.options as unknown as Prisma.InputJsonValue,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: { phases: { orderBy: { order: 'asc' } } },
    });

    this.logger.log(
      `AI-generated scenario created: ${scenario.id} — "${scenario.title}"`,
    );
    return scenario;
  }

  private buildPrompt(
    input: GenerateScenarioInput,
    difficulty: string,
    sector: string,
    scenarioType: string,
  ): string {
    const parts: string[] = [
      `Genere un scenario complet de simulation de gestion de projet avec les parametres suivants :`,
      ``,
      `- Secteur : ${sector}`,
      `- Difficulte : ${difficulty}`,
      `- Type : ${scenarioType}`,
    ];

    if (input.projectName) {
      parts.push(`- Nom du projet : ${input.projectName}`);
    }
    if (input.projectDescription) {
      parts.push(`- Description : ${input.projectDescription}`);
    }
    if (input.constraints) {
      parts.push(`- Contraintes : ${input.constraints}`);
    }
    if (input.learningObjectives) {
      parts.push(
        `- Objectifs d'apprentissage : ${input.learningObjectives}`,
      );
    }
    if (input.skills?.length) {
      const skillNames = input.skills.map((s) => s.name).join(', ');
      parts.push(`- Competences a travailler : ${skillNames}`);
    }
    if (input.profileType) {
      parts.push(`- Profil apprenant : ${input.profileType}`);
    }

    parts.push(``);
    parts.push(`Reponds en JSON avec cette structure exacte :`);
    parts.push(`{`);
    parts.push(`  "title": "Titre du scenario (court, accrocheur)",`);
    parts.push(
      `  "description": "Description detaillee du contexte (3-5 phrases)",`,
    );
    parts.push(
      `  "objectives": ["objectif 1", "objectif 2", "objectif 3", "objectif 4"],`,
    );
    parts.push(
      `  "competencies": ["competence1", "competence2", "competence3", "competence4"],`,
    );
    parts.push(`  "estimatedDurationHours": 4,`);
    parts.push(`  "projectTemplate": {`);
    parts.push(`    "name": "Nom du projet",`);
    parts.push(`    "client": "Nom du client",`);
    parts.push(`    "sector": "${sector}",`);
    parts.push(`    "description": "Description du projet",`);
    parts.push(`    "teamSize": 5,`);
    parts.push(`    "initialBudget": 150000,`);
    parts.push(`    "deadlineDays": 180,`);
    parts.push(
      `    "team": [{"name": "Prenom Nom", "role": "Role", "expertise": "JUNIOR|INTERMEDIATE|SENIOR", "personality": "COOPERATIVE|NEUTRAL|RESISTANT", "morale": 75}],`,
    );
    parts.push(
      `    "deliverables": [{"name": "Nom", "description": "Description", "phaseOrder": 0, "type": "charter"}]`,
    );
    parts.push(`  },`);
    parts.push(
      `  "initialKpis": {"budget": 100, "schedule": 100, "quality": 80, "teamMorale": 75, "riskLevel": 20},`,
    );
    parts.push(`  "phases": [`);
    parts.push(`    {`);
    parts.push(`      "name": "Nom de phase",`);
    parts.push(
      `      "type": "INITIATION|PLANNING|EXECUTION|MONITORING|CLOSURE",`,
    );
    parts.push(`      "durationDays": 10,`);
    parts.push(`      "description": "Description de la phase",`);
    parts.push(
      `      "meetingTemplates": [{"title": "Titre", "type": "KICKOFF|STEERING|STANDUP|CRISIS", "objectives": ["obj"], "durationMinutes": 30, "participants": [{"name": "Nom", "role": "Role", "personality": "Description", "cooperationLevel": 3}]}],`,
    );
    parts.push(
      `      "decisionTemplates": [{"title": "Titre", "context": "Contexte", "options": [{"label": "Option", "description": "Description", "kpiImpact": {"budget": 0, "schedule": 0, "quality": 0, "teamMorale": 0, "riskLevel": 0}}]}]`,
    );
    parts.push(`    }`);
    parts.push(`  ]`);
    parts.push(`}`);
    parts.push(``);
    parts.push(`IMPORTANT :`);
    parts.push(
      `- Genere exactement 5 phases (INITIATION, PLANNING, EXECUTION, MONITORING, CLOSURE)`,
    );
    parts.push(
      `- ${difficulty === 'BEGINNER' ? '1 decision par phase, equipe cooperative' : difficulty === 'INTERMEDIATE' ? '1-2 decisions par phase, mix de personnalites' : '2 decisions par phase, personnalites resistantes'}`,
    );
    parts.push(`- 1 meeting par phase (pas plus)`);
    parts.push(`- Descriptions courtes (1-2 phrases max par champ)`);
    parts.push(
      `- 4-7 membres d'equipe avec des prenoms/noms francais realistes`,
    );
    parts.push(`- 5-7 livrables repartis sur les phases`);
    parts.push(`- Contexte realiste pour le secteur ${sector}`);
    parts.push(`- Tout en francais`);

    return parts.join('\n');
  }

  private mapProfileToDifficulty(profileType?: string): string {
    switch (profileType) {
      case 'ZERO_EXPERIENCE':
        return 'BEGINNER';
      case 'BEGINNER':
        return 'BEGINNER';
      case 'RECONVERSION':
        return 'INTERMEDIATE';
      case 'REINFORCEMENT':
        return 'ADVANCED';
      default:
        return 'INTERMEDIATE';
    }
  }
}
