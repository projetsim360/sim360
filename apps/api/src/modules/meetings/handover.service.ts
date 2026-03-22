import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';

const HANDOVER_HR_AGENDA = [
  'Bienvenue et presentation de l\'entreprise',
  'Culture et valeurs de l\'organisation',
  'Regles internes et processus de communication',
  'Outils mis a votre disposition',
  'Attentes du poste de Chef de Projet',
  'Contacts cles et organigramme',
  'Session questions-reponses',
];

const HANDOVER_PMO_AGENDA = [
  'Contexte et objectifs du projet',
  'Methodologie de gestion de projet (PMBOK)',
  'Phases du projet et jalons',
  'Livrables attendus par phase',
  'Equipe projet et parties prenantes',
  'Outils de pilotage (KPIs, reunions, livrables)',
  'Session questions-reponses',
];

const HANDOVER_PMO_BROWNFIELD_EXTRA = [
  'Historique du projet et decisions passees',
  'Etat actuel : retards, budget, risques',
  'Actions prioritaires et "feux a eteindre"',
  'Attentes du Sponsor pour le redressement',
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
              role: 'Office Manager',
              personality: 'Pratique et organise. Gere la logistique : badge d\'acces, poste de travail, outils informatiques. Repond aux questions concretes sur le quotidien au bureau.',
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
      : `Le PMO vous presente le projet "${projectName}" et la methodologie a suivre.`;

    const pmoMeeting = await this.prisma.meeting.create({
      data: {
        simulationId,
        phaseOrder: simulation.currentPhaseOrder,
        title: 'Passation PMO — Presentation du projet',
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
      IT: 'Culture agile et innovante. Teletravail flexible, methodologie Scrum/Kanban. Open spaces avec zones de concentration. Dress code decontracte. Hackathons trimestriels.',
      CONSTRUCTION: 'Culture de terrain et de securite. Reunions de chantier hebdomadaires. Respect strict des normes HSE. Hierarchie claire mais accessible. Esprit d\'equipe fort.',
      MARKETING: 'Culture creative et collaborative. Brainstormings reguliers. Environnement dynamique et fast-paced. KPIs orientes resultats. Evenements team-building mensuels.',
      HEALTHCARE: 'Culture patient-centrique et rigoureuse. Protocoles stricts de conformite. Formation continue obligatoire. Respect des normes sanitaires. Communication interprofessionnelle.',
      FINANCE: 'Culture de performance et de compliance. Processus rigoureux de validation. Confidentialite des donnees absolue. Dress code business. Reporting financier mensuel.',
      CUSTOM: 'Culture professionnelle et collaborative. Valeurs d\'innovation et d\'excellence operationnelle.',
    };

    const culture = sectorCultures[sector] ?? sectorCultures.CUSTOM;

    return [
      'Tu es Claire Dumont, Directrice des Ressources Humaines.',
      'Tu accueilles un nouveau Chef de Projet qui rejoint l\'entreprise.',
      `Le projet s'appelle "${projectName}".`,
      '',
      'Ton role dans cette reunion :',
      '1. Souhaiter la bienvenue chaleureusement',
      '2. Presenter la culture et les valeurs de l\'entreprise',
      '3. Expliquer les regles internes (horaires, communication, escalade)',
      '4. Presenter les outils a disposition',
      '5. Clarifier les attentes du poste de Chef de Projet',
      '6. Presenter les contacts cles',
      '7. Repondre aux questions',
      '',
      `Culture de l'entreprise : ${culture}`,
      '',
      'Style : Chaleureuse mais professionnelle. Tu tutoies apres quelques echanges.',
      'Tu es enthousiaste a l\'idee d\'accueillir un nouveau talent.',
      'Tu donnes des informations concretes et pratiques.',
    ].join('\n');
  }

  private generatePmoPersonality(
    sector: string,
    isBrownfield: boolean,
    brownfieldContext: Record<string, any> | null,
  ): string {
    const base = [
      'Tu es Alexandre Bertrand, Responsable du PMO (Project Management Office).',
      'Expert en gestion de projet PMI/PMBOK avec 15 ans d\'experience.',
      'Tu es le referent methodologique de l\'entreprise.',
      '',
      'Ton role dans cette reunion :',
      '1. Presenter le contexte et les objectifs du projet',
      '2. Expliquer la methodologie de gestion de projet (5 phases PMI)',
      '3. Detailler les livrables attendus a chaque phase',
      '4. Presenter l\'equipe et les parties prenantes cles',
      '5. Expliquer les outils de pilotage (KPIs, reunions, reporting)',
      '6. Repondre aux questions methodologiques',
    ];

    if (isBrownfield && brownfieldContext) {
      base.push(
        '',
        'CONTEXTE CRITIQUE — Reprise de projet :',
        `Le precedent chef de projet a quitte. ${brownfieldContext.previousPmNotes ?? ''}`,
        `Retard accumule : ${brownfieldContext.accumulatedDelays ?? 0} jours.`,
        `Budget consomme : ${Math.round((brownfieldContext.budgetUsed ?? 0) * 100)}%.`,
        `Moral equipe : ${brownfieldContext.teamMorale ?? 'inconnu'}.`,
        `Risques actifs : ${(brownfieldContext.knownRisks ?? []).filter((r: any) => r.status === 'ACTIVE').map((r: any) => r.title).join(', ') || 'aucun'}.`,
        '',
        'Tu dois etre DIRECT et TRANSPARENT sur la situation.',
        'N\'edulcore pas les problemes. Le nouveau CP doit comprendre l\'urgence.',
        'Propose des pistes d\'action concretes pour chaque probleme.',
      );
    } else {
      base.push(
        '',
        'Style : Methodique, pedagogue et encourageant.',
        'Tu expliques les concepts PMBOK de maniere accessible.',
        'Tu donnes des exemples concrets tires de ton experience.',
      );
    }

    return base.join('\n');
  }
}
