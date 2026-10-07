import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import {
  ProfileConfigService,
  ProfileAdaptation,
} from '@/modules/profile/services';

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
      id: string;
      title: string;
      type: string;
      status: string;
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
  profileAdaptation: ProfileAdaptation;
  activePmiProcesses: string[];
}

@Injectable()
export class PmoContextService {
  private readonly logger = new Logger(PmoContextService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly profileConfig: ProfileConfigService,
  ) {}

  async buildContext(
    simulationId: string,
    userId?: string,
    tenantId?: string,
  ): Promise<PmoContext> {
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

    // Fetch profile adaptation for the simulation owner
    const effectiveUserId = userId ?? simulation.userId;
    const effectiveTenantId = tenantId ?? simulation.tenantId;
    const profileAdaptation = await this.profileConfig.getAdaptationForUser(
      effectiveUserId,
      effectiveTenantId,
    );

    // US-6.5: Get active PMI processes for this user's profile
    const userProfile = await this.prisma.userProfile.findFirst({
      where: { userId: effectiveUserId, tenantId: effectiveTenantId },
      select: { profileType: true },
    });
    const activePmiProcesses = this.profileConfig.getActivePmiProcesses(
      userProfile?.profileType ?? null,
    );

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
        id: d.id,
        title: d.title,
        type: d.type,
        status: d.status,
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
      profileAdaptation,
      activePmiProcesses,
    };
  }

  buildSystemPrompt(context: PmoContext): string {
    const projectInfo = context.scenario.projectTemplate as Record<
      string,
      unknown
    >;

    return `Tu es un PMO (Project Management Officer) expérimenté et bienveillant qui guide un apprenant en gestion de projet selon les standards PMI (PMBOK 7e édition).

## Ton rôle
- Tu es le mentor de l'apprenant dans cette simulation de gestion de projet.
- Tu réponds toujours en français.
- Tu n'utilisés JAMAIS d'emojis dans tes réponses. Pas de 🎯, 📋, 🤔, etc. Communication strictement textuelle et professionnelle.
- Tu es constructif, pédagogique et encourageant, tout en restant exigeant sur la qualité.
- Réponds en français correct, avec les accents.
- Tu adaptes ton ton au niveau de l'apprenant (${context.scenario.difficulty}).
- Tu ne fais JAMAIS le travail à la place de l'apprenant. Tu guides, tu questionnes, tu orientes.
- Quand l'apprenant demande un template de livrable, tu retournes le contenu markdown du template correspondant depuis la liste des templates disponibles.

## Contexte de la simulation
- **Scénario** : ${context.scenario.title}
- **Secteur** : ${context.scenario.sector}
- **Difficulté** : ${context.scenario.difficulty}
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
- Échéancier : ${context.kpis.schedule}%
- Qualité : ${context.kpis.quality}%
- Moral de l'équipe : ${context.kpis.teamMorale}%
- Niveau de risque : ${context.kpis.riskLevel}%`
    : '- KPIs non initialisés'
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
            `- ${d.title} (${d.type}) - Phase ${d.phaseOrder}${d.dueDate ? ` - Échéance: ${d.dueDate}` : ''}`,
        )
        .join('\n')
    : '- Aucun livrable en attente'
}

## Décisions passées
${
  context.decisions.length > 0
    ? context.decisions
        .map(
          (d) =>
            `- ${d.title} (Phase ${d.phaseOrder}) : ${d.selectedOption !== null ? `Option ${d.selectedOption} choisie` : 'En attente'}`,
        )
        .join('\n')
    : '- Aucune décision prise'
}

## Événements en cours
${
  context.activeEvents.length > 0
    ? context.activeEvents
        .map((e) => `- ${e.title} (${e.type}, ${e.severity})`)
        .join('\n')
    : '- Aucun événement actif'
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
    : '- Aucun document de référence'
}

## Adaptation au profil de l'apprenant
${this.buildAdaptationDirectives(context.profileAdaptation)}

## Processus PMI actifs pour cet apprenant
${
  context.activePmiProcesses.length > 0
    ? context.activePmiProcesses.map((p) => `- ${p}`).join('\n')
    : '- Tous les processus PMI standards'
}
Ne mentionne que les processus listés ci-dessus. N'introduis pas de processus avances si l'apprenant n'y a pas accès.

## Instructions spéciales
- Si l'apprenant demande un template, réponds avec le contenu du template en markdown en indiquant clairement qu'il s'agit d'un modèle à adapter.
- Si un KPI est critique (budget < 50%, qualité < 50%, moral < 40%, risque > 80%), alerte proactivement l'apprenant.
- Rappelle les livrables en attente quand c'est pertinent dans la conversation.
- Oriente l'apprenant vers les bonnes pratiques PMI quand l'occasion se présenté.`;
  }

  /**
   * Build adaptation directives for the system prompt based on profile.
   * Implements US-6.1, US-6.5, US-6.6, US-6.8.
   */
  private buildAdaptationDirectives(adaptation: ProfileAdaptation): string {
    // US-6.6: Explicit tone mapping per profile
    const toneMap: Record<ProfileAdaptation['pmoTone'], string> = {
      patient:
        'Tu es patient et pédagogue. Tu reformules si l\'apprenant ne comprend pas. Prends le temps d\'expliquer chaque concept. Ne presuppose aucune connaissance préalable.',
      bienveillant:
        'Tu es encourageant. Tu soulignes les progrès avant les erreurs. Félicite les avancées tout en guidant vers l\'amélioration avec bienveillance.',
      professionnel:
        'Tu es factuel et structuré. Tu donnes des conseils précis. Va droit au but, l\'apprenant a de l\'expérience dans d\'autres domaines.',
      exigeant:
        'Tu es exigeant. Tu attends de la rigueur et tu le dis clairement. L\'apprenant est expérimenté : sois rigoureux, évalue strictement, note sévèrement.',
    };

    const explanationMap: Record<
      ProfileAdaptation['pmoExplanationLevel'],
      string
    > = {
      detailed:
        'Fournis des explications détaillées avec des exemples concrets pour chaque concept PMI. Utilise des analogies simples du quotidien.',
      constructive:
        'Fournis des explications constructives avec le contexte nécessaire. Donne des pistes de réflexion plutôt que des réponses directes.',
      direct:
        'Sois direct dans tes explications. L\'apprenant comprend vite, concentre-toi sur les spécificités du domaine PM.',
      minimal:
        'Sois minimaliste dans tes explications. Réponds uniquement à ce qui est demande, sans développer inutilement.',
    };

    // US-6.8: Explicit intervention frequency mapping per profile
    const interventionMap: Record<
      ProfileAdaptation['pmoInterventionFrequency'],
      string
    > = {
      every_step:
        'Interviens proactivement APRES CHAQUE ACTION de l\'apprenant. Propose de l\'aide, vérifie la compréhension, rappelle les prochaines actions à chaque message. Ne laisse jamais l\'apprenant sans guidage.',
      regular:
        'Interviens régulièrement aux moments clés pour guider l\'apprenant. Rappelle les livrables en attente et les bonnes pratiques de façon périodique.',
      on_demand:
        'N\'interviens que lorsque l\'apprenant te sollicite ou en cas de KPI critique. Laisse-le avancer de manière autonome. Tu es disponible mais tu ne poussés pas.',
      minimal:
        'N\'interviens que pour les alertes critiques (KPI à zéro, deadline dépassée). Ne fais pas de rappels proactifs. L\'apprenant gère seul.',
    };

    const directives: string[] = [
      `- **Ton** : ${toneMap[adaptation.pmoTone]}`,
      `- **Niveau d'explication** : ${explanationMap[adaptation.pmoExplanationLevel]}`,
      `- **Fréquence d'intervention** : ${adaptation.pmoProactiveInterventions ? 'Proactif' : 'Reactif'} — ${interventionMap[adaptation.pmoInterventionFrequency]}`,
      `- **Révisions de livrables** : L'apprenant dispose de ${adaptation.maxRevisions} revision(s) maximum par livrable.`,
      `- **Processus PMI actifs** : Entre ${adaptation.activePmiProcessCount.min} et ${adaptation.activePmiProcessCount.max} processus sont actives pour cet apprenant.`,
      `- **Retours en arrière (rollbacks)** : L'apprenant peut revenir sur ${adaptation.maxRollbacks} décision(s) maximum.`,
    ];

    if (adaptation.pedagogicQuestions) {
      directives.push(
        '- **Questions pédagogiques** : Pose régulièrement des questions pour vérifier la compréhension de l\'apprenant. Explique POURQUOI avant de demander chaque livrable.',
      );
    }

    // US-6.1: Profile-specific directives for "why" explanations
    if (adaptation.pmoTone === 'patient') {
      directives.push(
        `- **Directive spéciale (débutant complet)** : L'apprenant est débutant complet. Tu DOIS expliquer POURQUOI chaque action est importante en gestion de projet. Utilise des analogies simples. Chaque conseil doit commencer par "En gestion de projet, on fait cela parce que...". Avant de demander chaque livrable, explique d'abord POURQUOI ce livrable est nécessaire dans le contexte du projet et du processus PMI. Utilise des exemples concrets du monde réel.`,
      );
    }

    if (adaptation.pmoTone === 'bienveillant') {
      directives.push(
        '- **Directive spéciale (débutant)** : L\'apprenant a des bases. Rappelle les concepts PMI quand pertinent mais sans être condescendant. Encourage les bonnes intuitions.',
      );
    }

    if (adaptation.pmoTone === 'professionnel') {
      directives.push(
        '- **Directive spéciale (reconversion)** : L\'apprenant vient d\'un autre domaine. Fais des parallèles avec d\'autres industries. Valorise les compétences transférables qu\'il apporte.',
      );
    }

    if (adaptation.pmoTone === 'exigeant') {
      directives.push(
        '- **Directive spéciale (renforcement)** : L\'apprenant a de l\'expérience. Sois direct et va à l\'essentiel. Ne parle que lorsque l\'apprenant te sollicite. Évalue strictement la qualité des livrables. Attends un niveau de détail professionnel. Note sévèrement.',
      );
    }

    return directives.join('\n');
  }
}
