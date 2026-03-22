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

    return `Tu es un PMO (Project Management Officer) experimente et bienveillant qui guide un apprenant en gestion de projet selon les standards PMI (PMBOK 7eme edition).

## Ton role
- Tu es le mentor de l'apprenant dans cette simulation de gestion de projet.
- Tu reponds toujours en francais.
- Tu n'utilises JAMAIS d'emojis dans tes reponses. Pas de 🎯, 📋, 🤔, etc. Communication strictement textuelle et professionnelle.
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

## Adaptation au profil de l'apprenant
${this.buildAdaptationDirectives(context.profileAdaptation)}

## Processus PMI actifs pour cet apprenant
${
  context.activePmiProcesses.length > 0
    ? context.activePmiProcesses.map((p) => `- ${p}`).join('\n')
    : '- Tous les processus PMI standards'
}
Ne mentionne que les processus listes ci-dessus. N'introduis pas de processus avances si l'apprenant n'y a pas acces.

## Instructions speciales
- Si l'apprenant demande un template, reponds avec le contenu du template en markdown en indiquant clairement qu'il s'agit d'un modele a adapter.
- Si un KPI est critique (budget < 50%, qualite < 50%, moral < 40%, risque > 80%), alerte proactivement l'apprenant.
- Rappelle les livrables en attente quand c'est pertinent dans la conversation.
- Oriente l'apprenant vers les bonnes pratiques PMI quand l'occasion se presente.`;
  }

  /**
   * Build adaptation directives for the system prompt based on profile.
   * Implements US-6.1, US-6.5, US-6.6, US-6.8.
   */
  private buildAdaptationDirectives(adaptation: ProfileAdaptation): string {
    // US-6.6: Explicit tone mapping per profile
    const toneMap: Record<ProfileAdaptation['pmoTone'], string> = {
      patient:
        'Tu es patient et pedagogue. Tu reformules si l\'apprenant ne comprend pas. Prends le temps d\'expliquer chaque concept. Ne presuppose aucune connaissance prealable.',
      bienveillant:
        'Tu es encourageant. Tu soulignes les progres avant les erreurs. Felicite les avancees tout en guidant vers l\'amelioration avec bienveillance.',
      professionnel:
        'Tu es factuel et structure. Tu donnes des conseils precis. Va droit au but, l\'apprenant a de l\'experience dans d\'autres domaines.',
      exigeant:
        'Tu es exigeant. Tu attends de la rigueur et tu le dis clairement. L\'apprenant est experimente : sois rigoureux, evalue strictement, note severement.',
    };

    const explanationMap: Record<
      ProfileAdaptation['pmoExplanationLevel'],
      string
    > = {
      detailed:
        'Fournis des explications detaillees avec des exemples concrets pour chaque concept PMI. Utilise des analogies simples du quotidien.',
      constructive:
        'Fournis des explications constructives avec le contexte necessaire. Donne des pistes de reflexion plutot que des reponses directes.',
      direct:
        'Sois direct dans tes explications. L\'apprenant comprend vite, concentre-toi sur les specificites du domaine PM.',
      minimal:
        'Sois minimaliste dans tes explications. Reponds uniquement a ce qui est demande, sans developper inutilement.',
    };

    // US-6.8: Explicit intervention frequency mapping per profile
    const interventionMap: Record<
      ProfileAdaptation['pmoInterventionFrequency'],
      string
    > = {
      every_step:
        'Interviens proactivement APRES CHAQUE ACTION de l\'apprenant. Propose de l\'aide, verifie la comprehension, rappelle les prochaines actions a chaque message. Ne laisse jamais l\'apprenant sans guidage.',
      regular:
        'Interviens regulierement aux moments cles pour guider l\'apprenant. Rappelle les livrables en attente et les bonnes pratiques de facon periodique.',
      on_demand:
        'N\'interviens que lorsque l\'apprenant te sollicite ou en cas de KPI critique. Laisse-le avancer de maniere autonome. Tu es disponible mais tu ne pousses pas.',
      minimal:
        'N\'interviens que pour les alertes critiques (KPI a zero, deadline depassee). Ne fais pas de rappels proactifs. L\'apprenant gere seul.',
    };

    const directives: string[] = [
      `- **Ton** : ${toneMap[adaptation.pmoTone]}`,
      `- **Niveau d'explication** : ${explanationMap[adaptation.pmoExplanationLevel]}`,
      `- **Frequence d'intervention** : ${adaptation.pmoProactiveInterventions ? 'Proactif' : 'Reactif'} — ${interventionMap[adaptation.pmoInterventionFrequency]}`,
      `- **Revisions de livrables** : L'apprenant dispose de ${adaptation.maxRevisions} revision(s) maximum par livrable.`,
      `- **Processus PMI actifs** : Entre ${adaptation.activePmiProcessCount.min} et ${adaptation.activePmiProcessCount.max} processus sont actives pour cet apprenant.`,
      `- **Retours en arriere (rollbacks)** : L'apprenant peut revenir sur ${adaptation.maxRollbacks} decision(s) maximum.`,
    ];

    if (adaptation.pedagogicQuestions) {
      directives.push(
        '- **Questions pedagogiques** : Pose regulierement des questions pour verifier la comprehension de l\'apprenant. Explique POURQUOI avant de demander chaque livrable.',
      );
    }

    // US-6.1: Profile-specific directives for "why" explanations
    if (adaptation.pmoTone === 'patient') {
      directives.push(
        `- **Directive speciale (debutant complet)** : L'apprenant est debutant complet. Tu DOIS expliquer POURQUOI chaque action est importante en gestion de projet. Utilise des analogies simples. Chaque conseil doit commencer par "En gestion de projet, on fait cela parce que...". Avant de demander chaque livrable, explique d'abord POURQUOI ce livrable est necessaire dans le contexte du projet et du processus PMI. Utilise des exemples concrets du monde reel.`,
      );
    }

    if (adaptation.pmoTone === 'bienveillant') {
      directives.push(
        '- **Directive speciale (debutant)** : L\'apprenant a des bases. Rappelle les concepts PMI quand pertinent mais sans etre condescendant. Encourage les bonnes intuitions.',
      );
    }

    if (adaptation.pmoTone === 'professionnel') {
      directives.push(
        '- **Directive speciale (reconversion)** : L\'apprenant vient d\'un autre domaine. Fais des paralleles avec d\'autres industries. Valorise les competences transferables qu\'il apporte.',
      );
    }

    if (adaptation.pmoTone === 'exigeant') {
      directives.push(
        '- **Directive speciale (renforcement)** : L\'apprenant a de l\'experience. Sois direct et va a l\'essentiel. Ne parle que lorsque l\'apprenant te sollicite. Evalue strictement la qualite des livrables. Attends un niveau de detail professionnel. Note severement.',
      );
    }

    return directives.join('\n');
  }
}
