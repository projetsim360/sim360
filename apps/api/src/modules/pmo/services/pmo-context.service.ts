import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';

export interface PmoContext {
  simulation: {
    id: string;
    status: string;
    currentPhaseOrder: number;
  };
  scenario: {
    title: string;
    sector: string;
    difficulty: string;
    objectives: string[];
    projectTemplate: Record<string, unknown>;
  };
  currentPhase: {
    name: string;
    type: string;
    status: string;
    order: number;
  } | null;
  kpis: {
    budget: number;
    schedule: number;
    quality: number;
    teamMorale: number;
    riskLevel: number;
  } | null;
  deliverables: {
    submitted: Array<{
      title: string;
      type: string;
      status: string;
      latestScore: number | null;
      latestGrade: string | null;
    }>;
    pending: Array<{
      title: string;
      type: string;
      phaseOrder: number;
      dueDate: string | null;
    }>;
  };
  decisions: Array<{
    title: string;
    selectedOption: number | null;
    phaseOrder: number;
  }>;
  activeEvents: Array<{
    title: string;
    type: string;
    severity: string;
  }>;
  templates: Array<{
    id: string;
    title: string;
    type: string;
    phase: string;
  }>;
  referenceDocuments: Array<{
    id: string;
    title: string;
    category: string;
    phase: string | null;
  }>;
}

@Injectable()
export class PmoContextService {
  private readonly logger = new Logger(PmoContextService.name);

  constructor(private readonly prisma: PrismaService) {}

  async buildContext(simulationId: string): Promise<PmoContext> {
    const simulation = await this.prisma.simulation.findUniqueOrThrow({
      where: { id: simulationId },
      include: {
        scenario: true,
        kpis: true,
        phases: { orderBy: { order: 'asc' } },
        decisions: { orderBy: { phaseOrder: 'asc' } },
        randomEvents: {
          where: { resolvedAt: null },
          orderBy: { phaseOrder: 'asc' },
        },
        userDeliverables: {
          include: {
            evaluations: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const currentPhase =
      simulation.phases.find(
        (p) => p.order === simulation.currentPhaseOrder,
      ) ?? null;

    // Fetch templates available for this tenant
    const templates = await this.prisma.deliverableTemplate.findMany({
      where: {
        tenantId: simulation.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        type: true,
        phase: true,
      },
    });

    // Fetch reference documents available for this tenant
    const referenceDocuments = await this.prisma.referenceDocument.findMany({
      where: {
        tenantId: simulation.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        category: true,
        phase: true,
      },
    });

    const submitted = simulation.userDeliverables
      .filter((d) => d.status !== 'DRAFT')
      .map((d) => ({
        title: d.title,
        type: d.type,
        status: d.status,
        latestScore: d.evaluations[0]?.score ?? null,
        latestGrade: d.evaluations[0]?.grade ?? null,
      }));

    const pending = simulation.userDeliverables
      .filter((d) => d.status === 'DRAFT' || d.status === 'REVISED')
      .map((d) => ({
        title: d.title,
        type: d.type,
        phaseOrder: d.phaseOrder,
        dueDate: d.dueDate?.toISOString() ?? null,
      }));

    return {
      simulation: {
        id: simulation.id,
        status: simulation.status,
        currentPhaseOrder: simulation.currentPhaseOrder,
      },
      scenario: {
        title: simulation.scenario.title,
        sector: simulation.scenario.sector,
        difficulty: simulation.scenario.difficulty,
        objectives: simulation.scenario.objectives,
        projectTemplate: simulation.scenario.projectTemplate as Record<
          string,
          unknown
        >,
      },
      currentPhase: currentPhase
        ? {
            name: currentPhase.name,
            type: currentPhase.type,
            status: currentPhase.status,
            order: currentPhase.order,
          }
        : null,
      kpis: simulation.kpis
        ? {
            budget: simulation.kpis.budget,
            schedule: simulation.kpis.schedule,
            quality: simulation.kpis.quality,
            teamMorale: simulation.kpis.teamMorale,
            riskLevel: simulation.kpis.riskLevel,
          }
        : null,
      deliverables: { submitted, pending },
      decisions: simulation.decisions.map((d) => ({
        title: d.title,
        selectedOption: d.selectedOption,
        phaseOrder: d.phaseOrder,
      })),
      activeEvents: simulation.randomEvents.map((e) => ({
        title: e.title,
        type: e.type,
        severity: e.severity,
      })),
      templates: templates.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        phase: t.phase,
      })),
      referenceDocuments: referenceDocuments.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        phase: d.phase,
      })),
    };
  }

  buildSystemPrompt(context: PmoContext): string {
    const projectInfo = context.scenario.projectTemplate as Record<
      string,
      unknown
    >;

    return `Tu es un PMO (Project Management Officer) experimente et bienveillant qui guide un apprenant en gestion de projet selon les standards PMI (PMBOK 7eme edition).

## Ton role
- Tu es le mentor de l'apprenant dans cette simulation de gestion de projet.
- Tu reponds toujours en francais.
- Tu es constructif, pedagogique et encourageant, tout en restant exigeant sur la qualite.
- Tu adaptes ton ton au niveau de l'apprenant (${context.scenario.difficulty}).
- Tu ne fais JAMAIS le travail a la place de l'apprenant. Tu guides, tu questionnes, tu orientes.
- Quand l'apprenant demande un template de livrable, tu retournes le contenu markdown du template correspondant depuis la liste des templates disponibles.

## Contexte de la simulation
- **Scenario** : ${context.scenario.title}
- **Secteur** : ${context.scenario.sector}
- **Difficulte** : ${context.scenario.difficulty}
- **Objectifs** : ${context.scenario.objectives.join(', ')}
- **Projet** : ${projectInfo.name || 'N/A'} pour le client ${projectInfo.client || 'N/A'}
- **Description** : ${projectInfo.description || 'N/A'}
- **Budget initial** : ${projectInfo.initialBudget || 'N/A'}
- **Deadline** : ${projectInfo.deadlineDays || 'N/A'} jours

## Phase actuelle
${
  context.currentPhase
    ? `- **Phase** : ${context.currentPhase.name} (${context.currentPhase.type}) - ${context.currentPhase.status}
- **Ordre** : ${context.currentPhase.order}`
    : '- Aucune phase active'
}

## KPIs actuels
${
  context.kpis
    ? `- Budget : ${context.kpis.budget}%
- Echeancier : ${context.kpis.schedule}%
- Qualite : ${context.kpis.quality}%
- Moral equipe : ${context.kpis.teamMorale}%
- Niveau de risque : ${context.kpis.riskLevel}%`
    : '- KPIs non initialises'
}

## Livrables soumis
${
  context.deliverables.submitted.length > 0
    ? context.deliverables.submitted
        .map(
          (d) =>
            `- ${d.title} (${d.type}) : ${d.status}${d.latestScore !== null ? ` - Score: ${d.latestScore}/100 (${d.latestGrade})` : ''}`,
        )
        .join('\n')
    : '- Aucun livrable soumis'
}

## Livrables en attente
${
  context.deliverables.pending.length > 0
    ? context.deliverables.pending
        .map(
          (d) =>
            `- ${d.title} (${d.type}) - Phase ${d.phaseOrder}${d.dueDate ? ` - Echeance: ${d.dueDate}` : ''}`,
        )
        .join('\n')
    : '- Aucun livrable en attente'
}

## Decisions passees
${
  context.decisions.length > 0
    ? context.decisions
        .map(
          (d) =>
            `- ${d.title} (Phase ${d.phaseOrder}) : ${d.selectedOption !== null ? `Option ${d.selectedOption} choisie` : 'En attente'}`,
        )
        .join('\n')
    : '- Aucune decision prise'
}

## Evenements en cours
${
  context.activeEvents.length > 0
    ? context.activeEvents
        .map((e) => `- ${e.title} (${e.type}, ${e.severity})`)
        .join('\n')
    : '- Aucun evenement actif'
}

## Templates de livrables disponibles
${
  context.templates.length > 0
    ? context.templates
        .map((t) => `- [${t.id}] ${t.title} (${t.type}, phase: ${t.phase})`)
        .join('\n')
    : '- Aucun template disponible'
}

## Documents de reference disponibles
${
  context.referenceDocuments.length > 0
    ? context.referenceDocuments
        .map(
          (d) =>
            `- [${d.id}] ${d.title} (${d.category}${d.phase ? `, phase: ${d.phase}` : ''})`,
        )
        .join('\n')
    : '- Aucun document de reference'
}

## Instructions speciales
- Si l'apprenant demande un template, reponds avec le contenu du template en markdown en indiquant clairement qu'il s'agit d'un modele a adapter.
- Si un KPI est critique (budget < 50%, qualite < 50%, moral < 40%, risque > 80%), alerte proactivement l'apprenant.
- Rappelle les livrables en attente quand c'est pertinent dans la conversation.
- Oriente l'apprenant vers les bonnes pratiques PMI quand l'occasion se presente.`;
  }
}
