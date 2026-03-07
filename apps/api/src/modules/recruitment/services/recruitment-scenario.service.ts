import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { RandomEventType, Severity, PhaseType, Sector, Difficulty } from '@prisma/client';
import { AiService } from '../../ai/ai.service';

interface GeneratedScenarioConfig {
  title: string;
  description: string;
  objectives: string[];
  sector: string;
  difficulty: string;
  estimatedDurationHours: number;
  competencies: string[];
  projectTemplate: {
    name: string;
    client: string;
    sector: string;
    description: string;
    initialBudget: number;
    deadlineDays: number;
    team: Array<{
      name: string;
      role: string;
      expertise: string;
      personality: string;
    }>;
    deliverables: Array<{
      name: string;
      description: string;
      phaseOrder: number;
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
    order: number;
    name: string;
    description: string;
    type: string;
    durationDays: number;
    meetings: Array<{
      title: string;
      description: string;
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
    decisions: Array<{
      title: string;
      context: string;
      options: Array<{
        label: string;
        description: string;
        kpiImpact: {
          budget?: number;
          schedule?: number;
          quality?: number;
          teamMorale?: number;
          riskLevel?: number;
        };
      }>;
      optimalOption?: number;
      timeLimitSeconds?: number;
    }>;
    randomEvents: Array<{
      type: string;
      title: string;
      description: string;
      severity: string;
      probability: number;
      options: Array<{
        label: string;
        description: string;
        kpiImpact: {
          budget?: number;
          schedule?: number;
          quality?: number;
          teamMorale?: number;
          riskLevel?: number;
        };
      }>;
    }>;
  }>;
}

@Injectable()
export class RecruitmentScenarioService {
  private readonly logger = new Logger(RecruitmentScenarioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
    private readonly aiService: AiService,
  ) {}

  async generateScenarioForCampaign(campaignId: string, tenantId: string, recruiterId: string) {
    const campaign = await this.prisma.recruitmentCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) throw new NotFoundException('Campagne introuvable');
    if (campaign.tenantId !== tenantId) throw new BadRequestException('Acces refuse');
    if (campaign.generatedScenarioId) {
      throw new BadRequestException('Un scenario a deja ete genere pour cette campagne');
    }

    const skills = campaign.requiredSkills as Array<{ skill: string; weight: number }>;
    const internalDocs = campaign.internalDocuments as Array<{ fileName: string; description: string }> | null;

    const systemPrompt = `Tu es un expert en conception pedagogique et recrutement. Tu crees un scenario de simulation realiste pour evaluer les competences d'un candidat a un poste de gestion de projet.

Le scenario doit :
- Etre realiste et representatif du poste vise
- Comporter 5 phases (Initiation, Planning, Execution, Monitoring, Closure)
- Inclure des decisions qui testent les competences requises
- Inclure des reunions avec des personnages ayant des personnalites variees
- Inclure des evenements aleatoires pour tester l'adaptabilite
- Les impacts KPI doivent etre equilibres et realistes (entre -20 et +15 par option)
- Adapter la difficulte et le contexte au niveau d'experience requis
- Integrer la culture d'entreprise dans les interactions et les attentes

Tu dois repondre UNIQUEMENT avec un objet JSON valide (sans commentaires, sans markdown).`;

    const prompt = `Genere un scenario de simulation complet pour evaluer un candidat au poste suivant :

**Poste** : ${campaign.jobTitle}
**Description** : ${campaign.jobDescription}
**Competences requises** : ${skills.map((s) => `${s.skill} (poids: ${s.weight})`).join(', ')}
**Niveau d'experience** : ${campaign.experienceLevel}
**Types de projets** : ${campaign.projectTypes.join(', ')}
**Culture d'entreprise** : ${campaign.culture}${campaign.cultureDescription ? ` - ${campaign.cultureDescription}` : ''}
${internalDocs?.length ? `**Documents internes** : ${internalDocs.map((d) => `${d.fileName}: ${d.description}`).join('; ')}` : ''}

Reponds avec un JSON ayant cette structure exacte :
{
  "title": "string",
  "description": "string",
  "objectives": ["string"],
  "sector": "IT|CONSTRUCTION|MARKETING|HEALTHCARE|FINANCE|CUSTOM",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "estimatedDurationHours": number,
  "competencies": ["string"],
  "projectTemplate": {
    "name": "string",
    "client": "string",
    "sector": "string",
    "description": "string",
    "initialBudget": number,
    "deadlineDays": number,
    "team": [{ "name": "string", "role": "string", "expertise": "JUNIOR|INTERMEDIATE|SENIOR", "personality": "COOPERATIVE|NEUTRAL|DIFFICULT|RESISTANT" }],
    "deliverables": [{ "name": "string", "description": "string", "phaseOrder": number }]
  },
  "initialKpis": { "budget": 100, "schedule": 100, "quality": 80, "teamMorale": 75, "riskLevel": 20 },
  "phases": [{
    "order": number,
    "name": "string",
    "description": "string",
    "type": "INITIATION|PLANNING|EXECUTION|MONITORING|CLOSURE",
    "durationDays": number,
    "meetings": [{ "title": "string", "description": "string", "type": "KICKOFF|STANDUP|STEERING|RETROSPECTIVE|CRISIS|CUSTOM", "objectives": ["string"], "durationMinutes": number, "participants": [{ "name": "string", "role": "string", "personality": "string", "cooperationLevel": 1-5 }] }],
    "decisions": [{ "title": "string", "context": "string", "options": [{ "label": "string", "description": "string", "kpiImpact": { "budget": number, "schedule": number, "quality": number, "teamMorale": number, "riskLevel": number } }], "optimalOption": number, "timeLimitSeconds": number }],
    "randomEvents": [{ "type": "RISK|OPPORTUNITY|CRISIS|TEAM|TECHNICAL|EXTERNAL", "title": "string", "description": "string", "severity": "LOW|MEDIUM|HIGH|CRITICAL", "probability": 0.0-1.0, "options": [{ "label": "string", "description": "string", "kpiImpact": { "budget": number, "schedule": number, "quality": number, "teamMorale": number, "riskLevel": number } }] }]
  }]
}`;

    const result = await this.aiService.complete({
      prompt,
      systemPrompt,
      maxTokens: 8000,
      temperature: 0.8,
      trackingContext: {
        tenantId,
        userId: recruiterId,
        operation: 'recruitment.generate_scenario',
        metadata: { campaignId },
      },
    });

    let scenarioConfig: GeneratedScenarioConfig;
    try {
      // Extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = result.content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      scenarioConfig = JSON.parse(jsonStr);
    } catch (error) {
      this.logger.error(`Failed to parse AI scenario response: ${result.content.substring(0, 200)}`);
      throw new BadRequestException('Echec de la generation du scenario. Veuillez reessayer.');
    }

    // Create the scenario in DB within a transaction
    const scenario = await this.prisma.$transaction(async (tx) => {
      const newScenario = await tx.scenario.create({
        data: {
          title: scenarioConfig.title,
          description: scenarioConfig.description,
          objectives: scenarioConfig.objectives,
          sector: this.mapSector(scenarioConfig.sector),
          difficulty: this.mapDifficulty(scenarioConfig.difficulty),
          estimatedDurationHours: scenarioConfig.estimatedDurationHours ?? 4,
          competencies: scenarioConfig.competencies ?? [],
          projectTemplate: scenarioConfig.projectTemplate as any,
          initialKpis: scenarioConfig.initialKpis as any,
          isPublished: true,
          createdById: recruiterId,
          phases: {
            create: scenarioConfig.phases.map((phase) => ({
              order: phase.order,
              name: phase.name,
              description: phase.description,
              type: this.mapPhaseType(phase.type),
              durationDays: phase.durationDays ?? 5,
              meetingTemplates: phase.meetings?.length
                ? {
                    create: phase.meetings.map((m) => ({
                      title: m.title,
                      description: m.description,
                      type: m.type,
                      objectives: m.objectives ?? [],
                      durationMinutes: m.durationMinutes ?? 30,
                      participants: m.participants as any,
                    })),
                  }
                : undefined,
              decisionTemplates: phase.decisions?.length
                ? {
                    create: phase.decisions.map((d) => ({
                      title: d.title,
                      context: d.context,
                      options: d.options as any,
                      optimalOption: d.optimalOption,
                      timeLimitSeconds: d.timeLimitSeconds,
                    })),
                  }
                : undefined,
              randomEventTemplates: phase.randomEvents?.length
                ? {
                    create: phase.randomEvents.map((e) => ({
                      type: this.mapEventType(e.type),
                      title: e.title,
                      description: e.description,
                      severity: this.mapSeverity(e.severity),
                      probability: e.probability ?? 0.5,
                      options: e.options as any,
                    })),
                  }
                : undefined,
            })),
          },
        },
      });

      // Link scenario to campaign
      await tx.recruitmentCampaign.update({
        where: { id: campaignId },
        data: { generatedScenarioId: newScenario.id },
      });

      return newScenario;
    });

    await this.eventPublisher.publish(
      EventType.CAMPAIGN_SCENARIO_GENERATED,
      AggregateType.RECRUITMENT_CAMPAIGN,
      campaignId,
      { campaignId, scenarioId: scenario.id, scenarioTitle: scenario.title },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket'], priority: 2 },
    );

    return scenario;
  }

  private mapSector(sector: string): Sector {
    const valid = Object.values(Sector);
    return valid.includes(sector as Sector) ? (sector as Sector) : Sector.CUSTOM;
  }

  private mapDifficulty(difficulty: string): Difficulty {
    const valid = Object.values(Difficulty);
    return valid.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : Difficulty.INTERMEDIATE;
  }

  private mapPhaseType(type: string): PhaseType {
    const valid = Object.values(PhaseType);
    return valid.includes(type as PhaseType) ? (type as PhaseType) : PhaseType.EXECUTION;
  }

  private mapEventType(type: string): RandomEventType {
    const valid = Object.values(RandomEventType);
    return valid.includes(type as RandomEventType) ? (type as RandomEventType) : RandomEventType.RISK;
  }

  private mapSeverity(severity: string): Severity {
    const valid = Object.values(Severity);
    return valid.includes(severity as Severity) ? (severity as Severity) : Severity.MEDIUM;
  }
}
