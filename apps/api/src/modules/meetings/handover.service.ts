import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';

const HANDOVER_HR_AGENDA = [
  'Bienvenue et présentation de l\'entreprise',
  'Culture et valeurs de l\'organisation',
  'Règles internes et processus de communication',
  'Outils mis à votre disposition',
  'Attentes du poste de chef de projet',
  'Contacts clés et organigramme',
  'Période de questions',
];

const HANDOVER_PMO_AGENDA = [
  'Contexte et objectifs du projet',
  'Méthodologie de gestion de projet (PMBOK)',
  'Phases du projet et jalons',
  'Livrables attendus par phase',
  'Équipe de projet et parties prenantes',
  'Outils de pilotage (indicateurs, réunions, livrables)',
  'Période de questions',
];

const HANDOVER_PMO_BROWNFIELD_EXTRA = [
  'Historique du projet et décisions passées',
  'État actuel : retards, budget, risques',
  'Actions prioritaires et « feux à éteindre »',
  'Attentes du commanditaire pour le redressement',
];

@Injectable()
export class HandoverService {
  private readonly logger = new Logger(HandoverService.name);

  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisherService,
  ) {}

  /**
   * Trigger the full handover sequence for a simulation.
   * Creates HANDOVER_HR meeting, then HANDOVER_PMO meeting.
   */
  async triggerHandoverSequence(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        scenario: { select: { title: true, sector: true, scenarioType: true, brownfieldContext: true, description: true } },
        project: { select: { name: true, client: true, description: true } },
      },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');

    const isBrownfield = simulation.scenario.scenarioType === 'BROWNFIELD';
    const scenarioTitle = simulation.scenario.title;
    const projectName = simulation.project?.name ?? scenarioTitle;
    const sector = simulation.scenario.sector;

    // 1. Create HANDOVER_HR meeting
    const hrMeeting = await this.prisma.meeting.create({
      data: {
        simulationId,
        phaseOrder: simulation.currentPhaseOrder,
        title: 'Accueil RH — Bienvenue dans l\'entreprise',
        description: `La Directrice des Ressources Humaines vous accueille pour votre prise de poste en tant que Chef de Projet sur le projet "${projectName}".`,
        type: 'HANDOVER_HR',
        objectives: HANDOVER_HR_AGENDA,
        durationMinutes: 20,
        status: 'SCHEDULED',
        participants: {
          create: [
            {
              name: 'Claire Dumont',
              role: 'Directrice des Ressources Humaines',
              personality: this.generateHrPersonality(sector, projectName),
              cooperationLevel: 5,
              avatar: '/media/avatars/300-5.png',
            },
            {
              name: 'Maxime Roche',
              role: 'Responsable des services administratifs',
              personality: 'Pratique et organisé. Gère la logistique : carte d\'accès, poste de travail, outils informatiques. Répond aux questions concrètes sur le quotidien au bureau.',
              cooperationLevel: 5,
              avatar: '/media/avatars/300-14.png',
            },
          ],
        },
      },
    });

    // 2. Create HANDOVER_PMO meeting
    const pmoObjectives = isBrownfield
      ? [...HANDOVER_PMO_AGENDA, ...HANDOVER_PMO_BROWNFIELD_EXTRA]
      : HANDOVER_PMO_AGENDA;

    const brownfieldContext = isBrownfield && simulation.scenario.brownfieldContext
      ? simulation.scenario.brownfieldContext as Record<string, any>
      : null;

    const pmoDescription = isBrownfield
      ? `Le PMO vous fait le point sur le projet "${projectName}" que vous reprenez en cours de route. ${brownfieldContext?.previousPmNotes ?? ''}`
      : `Le PMO vous présente le projet « ${projectName} » et la méthodologie à suivre.`;

    const pmoMeeting = await this.prisma.meeting.create({
      data: {
        simulationId,
        phaseOrder: simulation.currentPhaseOrder,
        title: 'Passation PMO — Présentation du projet',
        description: pmoDescription,
        type: 'HANDOVER_PMO',
        objectives: pmoObjectives,
        durationMinutes: 30,
        status: 'SCHEDULED',
        participants: {
          create: [
            {
              name: 'Alexandre Bertrand',
              role: 'Responsable PMO',
              personality: this.generatePmoPersonality(sector, isBrownfield, brownfieldContext),
              cooperationLevel: 4,
              avatar: '/media/avatars/300-11.png',
            },
          ],
        },
      },
    });

    // Publish event
    await this.eventPublisher.publish(
      EventType.MEETING_STARTED,
      AggregateType.MEETING,
      hrMeeting.id,
      { title: hrMeeting.title, simulationId, type: 'HANDOVER_HR' },
      { actorId: userId, actorType: 'system', tenantId, receiverIds: [userId], channels: ['socket'], priority: 1 },
    ).catch(() => {});

    this.logger.log(`Handover sequence created for simulation ${simulationId}: HR(${hrMeeting.id}) + PMO(${pmoMeeting.id})`);

    return { hrMeeting, pmoMeeting };
  }

  /**
   * Check if the handover sequence is complete for a simulation.
   * Both HANDOVER_HR and HANDOVER_PMO meetings must be COMPLETED.
   */
  async isHandoverComplete(simulationId: string): Promise<boolean> {
    const handoverMeetings = await this.prisma.meeting.findMany({
      where: {
        simulationId,
        type: { in: ['HANDOVER_HR', 'HANDOVER_PMO'] },
      },
      select: { type: true, status: true },
    });

    if (handoverMeetings.length === 0) return true; // No handover meetings = skip

    const hrComplete = handoverMeetings.some((m) => m.type === 'HANDOVER_HR' && m.status === 'COMPLETED');
    const pmoComplete = handoverMeetings.some((m) => m.type === 'HANDOVER_PMO' && m.status === 'COMPLETED');

    return hrComplete && pmoComplete;
  }

  /**
   * Get handover status for a simulation.
   */
  async getHandoverStatus(simulationId: string) {
    const meetings = await this.prisma.meeting.findMany({
      where: {
        simulationId,
        type: { in: ['HANDOVER_HR', 'HANDOVER_PMO'] },
      },
      include: {
        participants: true,
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const hrMeeting = meetings.find((m) => m.type === 'HANDOVER_HR');
    const pmoMeeting = meetings.find((m) => m.type === 'HANDOVER_PMO');

    return {
      hasHandover: meetings.length > 0,
      hrMeeting: hrMeeting ?? null,
      pmoMeeting: pmoMeeting ?? null,
      isComplete: (hrMeeting?.status === 'COMPLETED') && (pmoMeeting?.status === 'COMPLETED'),
      currentStep: !hrMeeting || hrMeeting.status !== 'COMPLETED'
        ? 'HR'
        : !pmoMeeting || pmoMeeting.status !== 'COMPLETED'
          ? 'PMO'
          : 'DONE',
    };
  }

  /**
   * Transition from ONBOARDING to IN_PROGRESS when handover is done.
   */
  async completeHandover(simulationId: string, userId: string, tenantId: string) {
    const isComplete = await this.isHandoverComplete(simulationId);
    if (!isComplete) return false;

    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { status: true },
    });

    if (simulation?.status === 'ONBOARDING') {
      await this.prisma.simulation.update({
        where: { id: simulationId },
        data: { status: 'IN_PROGRESS' },
      });

      await this.eventPublisher.publish(
        EventType.SIMULATION_STARTED,
        AggregateType.SIMULATION,
        simulationId,
        { status: 'IN_PROGRESS', handoverCompleted: true },
        { actorId: userId, actorType: 'user', tenantId, receiverIds: [userId], channels: ['socket'], priority: 1 },
      ).catch(() => {});

      this.logger.log(`Handover complete for simulation ${simulationId}, transitioning to IN_PROGRESS`);
      return true;
    }

    return false;
  }

  private generateHrPersonality(sector: string, projectName: string): string {
    const sectorCultures: Record<string, string> = {
      IT: 'Culture agile et innovante. Télétravail flexible, méthodologie Scrum/Kanban. Espaces ouverts avec zones de concentration. Tenue décontractée. Hackathons trimestriels.',
      CONSTRUCTION: 'Culture de terrain et de sécurité. Réunions de chantier hebdomadaires. Respect strict des normes SST. Hiérarchie claire mais accessible. Esprit d\'équipe fort.',
      MARKETING: 'Culture créative et collaborative. Remue-méninges réguliers. Environnement dynamique au rythme soutenu. Indicateurs orientés résultats. Activités d\'équipe mensuelles.',
      HEALTHCARE: 'Culture centrée sur le patient et rigoureuse. Protocoles stricts de conformité. Formation continue obligatoire. Respect des normes sanitaires. Communication interprofessionnelle.',
      FINANCE: 'Culture de performance et de conformité. Processus rigoureux de validation. Confidentialité des données absolue. Tenue d\'affaires. Reddition de comptes financière mensuelle.',
      BANKING_INSURANCE: 'Culture de conformité réglementaire et de gestion des risques. Validation à plusieurs niveaux. Confidentialité des données clients. Comités hebdomadaires.',
      ENGINEERING: 'Culture technique et méthodique. Revues de conception formelles. Normes et codes au cœur des décisions. Responsabilité professionnelle des ingénieurs.',
      ENERGY: 'Culture de sûreté et de fiabilité. Planification pluriannuelle. Encadrement réglementaire fort. Relations étroites avec les communautés et les autorités.',
      TRANSPORT: 'Culture de sécurité et de continuité de service. Coordination avec plusieurs donneurs d\'ordre publics. Fenêtres de travaux contraintes.',
      MANUFACTURING: 'Culture de l\'amélioration continue (Lean, 5S). Indicateurs de production quotidiens. Santé et sécurité au travail prioritaires. Rythme de quarts.',
      PUBLIC_ADMINISTRATION: 'Culture de service public et de reddition de comptes. Processus d\'approbation formels. Respect des règles d\'appel d\'offres. Transparence exigée.',
      TELECOM: 'Culture technologique et orientée client. Déploiements par vagues. Disponibilité du réseau critique. Coordination terrain et centre d\'opérations.',
      AEROSPACE: 'Culture de qualité et de traçabilité extrêmes. Certifications et audits fréquents. Gestion rigoureuse des configurations. Tolérance zéro à l\'improvisation.',
      PROFESSIONAL_SERVICES: 'Culture orientée client et livrables. Facturation au temps. Gestion serrée de la portée. Équipes multidisciplinaires par mandat.',
      NATURAL_RESOURCES: 'Culture de terrain, de sécurité et d\'acceptabilité sociale. Sites éloignés. Contraintes environnementales et relations avec les Premières Nations.',
      LOGISTICS: 'Culture de la performance opérationnelle. Délais de livraison mesurés au quotidien. Coordination entrepôts, transporteurs et clients.',
      REAL_ESTATE: 'Culture de rentabilité et de gestion d\'actifs. Coordination promoteurs, professionnels et municipalités. Calendriers dictés par les permis.',
      EDUCATION: 'Culture pédagogique et collégiale. Calendrier scolaire structurant. Gouvernance participative. Ressources budgétaires limitées.',
      DIGITAL_TRANSFORMATION: 'Culture du changement. Parties prenantes métier et TI à aligner. Gestion de la résistance au changement. Livraisons incrémentales.',
      PRODUCT_DEVELOPMENT: 'Culture d\'innovation et d\'expérimentation. Itérations rapides avec les clients. Arbitrages constants entre portée, coût et délai de mise en marché.',
      CUSTOM: 'Culture professionnelle et collaborative. Valeurs d\'innovation et d\'excellence opérationnelle.',
    };

    const culture = sectorCultures[sector] ?? sectorCultures.CUSTOM;

    return [
      'Tu es Claire Dumont, Directrice des Ressources Humaines.',
      'Tu accueilles un nouveau chef de projet qui rejoint l\'entreprise.',
      `Le projet s'appelle « ${projectName} ».`,
      '',
      'Ton rôle dans cette réunion :',
      '1. Souhaiter la bienvenue chaleureusement',
      '2. Présenter la culture et les valeurs de l\'entreprise',
      '3. Expliquer les règles internes (horaires, communication, escalade)',
      '4. Présenter les outils à disposition',
      '5. Clarifier les attentes du poste de chef de projet',
      '6. Présenter les contacts clés',
      '7. Répondre aux questions',
      '',
      `Culture de l'entreprise : ${culture}`,
      '',
      'Style : chaleureuse mais professionnelle. Tu tutoies après quelques échanges.',
      'Tu es enthousiaste à l\'idée d\'accueillir un nouveau talent.',
      'Tu donnes des informations concrètes et pratiques. Réponds en français correct, avec les accents.',
    ].join('\n');
  }

  private generatePmoPersonality(
    sector: string,
    isBrownfield: boolean,
    brownfieldContext: Record<string, any> | null,
  ): string {
    const base = [
      'Tu es Alexandre Bertrand, Responsable du PMO (Project Management Office).',
      'Expert en gestion de projet PMI/PMBOK avec 15 ans d\'expérience.',
      'Tu es le référent méthodologique de l\'entreprise.',
      '',
      'Ton rôle dans cette réunion :',
      '1. Présenter le contexte et les objectifs du projet',
      '2. Expliquer la méthodologie de gestion de projet (5 phases PMI)',
      '3. Détailler les livrables attendus à chaque phase',
      '4. Présenter l\'équipe et les parties prenantes clés',
      '5. Expliquer les outils de pilotage (indicateurs, réunions, reddition de comptes)',
      '6. Répondre aux questions méthodologiques',
    ];

    if (isBrownfield && brownfieldContext) {
      base.push(
        '',
        'CONTEXTE CRITIQUE — Reprise de projet :',
        `Le précédent chef de projet est parti. ${brownfieldContext.previousPmNotes ?? ''}`,
        `Retard accumulé : ${brownfieldContext.accumulatedDelays ?? 0} jours.`,
        `Budget consommé : ${Math.round((brownfieldContext.budgetUsed ?? 0) * 100)}%.`,
        `Moral de l'équipe : ${brownfieldContext.teamMorale ?? 'inconnu'}.`,
        `Risques actifs : ${(brownfieldContext.knownRisks ?? []).filter((r: any) => r.status === 'ACTIVE').map((r: any) => r.title).join(', ') || 'aucun'}.`,
        '',
        'Tu dois être DIRECT et TRANSPARENT sur la situation.',
        'N\'édulcore pas les problèmes. Le nouveau chef de projet doit comprendre l\'urgence.',
        'Propose des pistes d\'action concrètes pour chaque problème. Réponds en français correct, avec les accents.',
      );
    } else {
      base.push(
        '',
        'Style : méthodique, pédagogue et encourageant.',
        'Tu expliques les concepts PMBOK de manière accessible.',
        'Tu donnes des exemples concrets tirés de ton expérience. Réponds en français correct, avec les accents.',
      );
    }

    return base.join('\n');
  }
}
