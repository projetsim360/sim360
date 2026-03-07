export enum EventType {
  USER_REGISTERED = 'user.registered',
  USER_LOGGED_IN = 'user.logged_in',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  PASSWORD_CHANGED = 'user.password_changed',
  EMAIL_CHANGED = 'user.email_changed',
  AVATAR_UPLOADED = 'user.avatar_uploaded',
  TWO_FACTOR_ENABLED = 'user.two_factor_enabled',
  TWO_FACTOR_DISABLED = 'user.two_factor_disabled',
  GOOGLE_LINKED = 'user.google_linked',
  GOOGLE_UNLINKED = 'user.google_unlinked',
  TENANT_UPDATED = 'tenant.updated',
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_READ = 'notification.read',

  // Project
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_TEAM_UPDATED = 'project.team_updated',
  PROJECT_DELIVERABLE_UPDATED = 'project.deliverable_updated',

  // Scenario
  SCENARIO_CREATED = 'scenario.created',
  SCENARIO_UPDATED = 'scenario.updated',

  // Simulation
  SIMULATION_CREATED = 'simulation.created',
  SIMULATION_STARTED = 'simulation.started',
  SIMULATION_PAUSED = 'simulation.paused',
  SIMULATION_RESUMED = 'simulation.resumed',
  SIMULATION_PHASE_ADVANCED = 'simulation.phase_advanced',
  SIMULATION_PHASE_COMPLETED = 'simulation.phase_completed',
  SIMULATION_COMPLETED = 'simulation.completed',
  SIMULATION_ABANDONED = 'simulation.abandoned',

  // Decision
  DECISION_PRESENTED = 'decision.presented',
  DECISION_MADE = 'decision.made',

  // Random Event
  RANDOM_EVENT_TRIGGERED = 'event.triggered',
  RANDOM_EVENT_RESOLVED = 'event.resolved',

  // Meeting
  MEETING_STARTED = 'meeting.started',
  MEETING_MESSAGE_SENT = 'meeting.message_sent',
  MEETING_COMPLETED = 'meeting.completed',

  // KPI
  KPI_UPDATED = 'kpi.updated',
  KPI_CRITICAL = 'kpi.critical',

  // Reference (EPIC 1)
  DELIVERABLE_TEMPLATE_CREATED = 'reference.deliverable_template_created',
  DELIVERABLE_TEMPLATE_UPDATED = 'reference.deliverable_template_updated',
  DELIVERABLE_TEMPLATE_TOGGLED = 'reference.deliverable_template_toggled',
  REFERENCE_DOCUMENT_CREATED = 'reference.document_created',
  REFERENCE_DOCUMENT_UPDATED = 'reference.document_updated',

  // PMO (EPIC 3)
  PMO_MESSAGE_SENT = 'pmo.message_sent',
  PMO_TEMPLATE_REQUESTED = 'pmo.template_requested',

  // User Deliverables (EPIC 4)
  DELIVERABLE_CREATED = 'deliverable.created',
  DELIVERABLE_SAVED = 'deliverable.saved',
  DELIVERABLE_SUBMITTED = 'deliverable.submitted',
  DELIVERABLE_EVALUATED = 'deliverable.evaluated',
  DELIVERABLE_REVISED = 'deliverable.revised',
  DELIVERABLE_VALIDATED = 'deliverable.validated',

  // AI
  AI_MEETING_RESPONSE = 'ai.meeting_response',
  AI_DECISION_EVALUATED = 'ai.decision_evaluated',
  AI_REPORT_GENERATED = 'ai.report_generated',
}

export enum AggregateType {
  USER = 'User',
  TENANT = 'Tenant',
  NOTIFICATION = 'Notification',
  AUTH = 'Auth',
  SYSTEM = 'System',
  PROJECT = 'Project',
  SCENARIO = 'Scenario',
  SIMULATION = 'Simulation',
  DECISION = 'Decision',
  RANDOM_EVENT = 'RandomEvent',
  MEETING = 'Meeting',
  DELIVERABLE_TEMPLATE = 'DeliverableTemplate',
  REFERENCE_DOCUMENT = 'ReferenceDocument',
  PMO_CONVERSATION = 'PmoConversation',
  USER_DELIVERABLE = 'UserDeliverable',
}

export type ChannelType = 'socket' | 'email';

export interface DomainEventMetadata {
  actorId: string;
  actorType: 'user' | 'system';
  actorName?: string;
  tenantId?: string;
  receiverIds?: string[];
  excludeActorFromReceivers?: boolean;
  channels: ChannelType[];
  priority?: 1 | 2 | 3;
}

export interface EventPublishContext {
  actorId: string;
  actorType?: 'user' | 'system';
  actorName?: string;
  tenantId?: string;
  receiverIds?: string[];
  excludeActorFromReceivers?: boolean;
  channels?: ChannelType[];
  priority?: 1 | 2 | 3;
  ip?: string;
  userAgent?: string;
}

export interface EventNotificationConfig {
  notificationType: string;
  category: string;
  titleTemplate: string;
  bodyTemplate: string;
  defaultChannels: ChannelType[];
  defaultPriority: 1 | 2 | 3;
}

export const EVENT_NOTIFICATION_CONFIG: Partial<Record<EventType, EventNotificationConfig>> = {
  [EventType.USER_REGISTERED]: {
    notificationType: 'member',
    category: 'system',
    titleTemplate: 'Bienvenue sur Sim360',
    bodyTemplate: 'Votre compte a ete cree avec succes.',
    defaultChannels: ['socket', 'email'],
    defaultPriority: 1,
  },
  [EventType.USER_LOGGED_IN]: {
    notificationType: 'security',
    category: 'security',
    titleTemplate: 'Nouvelle connexion detectee',
    bodyTemplate: '{{actorName}} s\'est connecte.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.PASSWORD_CHANGED]: {
    notificationType: 'security',
    category: 'security',
    titleTemplate: 'Mot de passe modifie',
    bodyTemplate: 'Votre mot de passe a ete modifie avec succes.',
    defaultChannels: ['socket', 'email'],
    defaultPriority: 2,
  },
  [EventType.EMAIL_CHANGED]: {
    notificationType: 'security',
    category: 'security',
    titleTemplate: 'Email modifie',
    bodyTemplate: 'Votre adresse email a ete modifiee.',
    defaultChannels: ['socket', 'email'],
    defaultPriority: 2,
  },
  [EventType.AVATAR_UPLOADED]: {
    notificationType: 'system',
    category: 'system',
    titleTemplate: 'Avatar mis a jour',
    bodyTemplate: '{{actorName}} a mis a jour son avatar.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.TWO_FACTOR_ENABLED]: {
    notificationType: 'security',
    category: 'security',
    titleTemplate: 'Authentification 2FA activee',
    bodyTemplate: 'L\'authentification a deux facteurs a ete activee sur votre compte.',
    defaultChannels: ['socket', 'email'],
    defaultPriority: 2,
  },
  [EventType.TWO_FACTOR_DISABLED]: {
    notificationType: 'security',
    category: 'security',
    titleTemplate: 'Authentification 2FA desactivee',
    bodyTemplate: 'L\'authentification a deux facteurs a ete desactivee sur votre compte.',
    defaultChannels: ['socket', 'email'],
    defaultPriority: 3,
  },
  [EventType.GOOGLE_LINKED]: {
    notificationType: 'security',
    category: 'security',
    titleTemplate: 'Compte Google lie',
    bodyTemplate: 'Un compte Google a ete lie a votre profil.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.GOOGLE_UNLINKED]: {
    notificationType: 'security',
    category: 'security',
    titleTemplate: 'Compte Google delie',
    bodyTemplate: 'Le compte Google a ete delie de votre profil.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.USER_UPDATED]: {
    notificationType: 'system',
    category: 'system',
    titleTemplate: 'Profil mis a jour',
    bodyTemplate: '{{actorName}} a mis a jour son profil.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.USER_DELETED]: {
    notificationType: 'system',
    category: 'system',
    titleTemplate: 'Compte supprime',
    bodyTemplate: 'Le compte a ete supprime.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.TENANT_UPDATED]: {
    notificationType: 'system',
    category: 'system',
    titleTemplate: 'Organisation mise a jour',
    bodyTemplate: 'Les informations de l\'organisation ont ete mises a jour.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.NOTIFICATION_READ]: {
    notificationType: 'system',
    category: 'system',
    titleTemplate: '',
    bodyTemplate: '',
    defaultChannels: [],
    defaultPriority: 1,
  },
  [EventType.SIMULATION_CREATED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Simulation creee',
    bodyTemplate: 'Votre simulation a ete creee avec succes.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.SIMULATION_STARTED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Simulation demarree',
    bodyTemplate: 'Votre simulation est maintenant en cours.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.SIMULATION_PHASE_ADVANCED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Nouvelle phase',
    bodyTemplate: 'Vous avez avance a la phase suivante.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.SIMULATION_COMPLETED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Simulation terminee',
    bodyTemplate: 'Votre simulation est terminee. Consultez votre rapport.',
    defaultChannels: ['socket', 'email'],
    defaultPriority: 2,
  },
  [EventType.DECISION_PRESENTED]: {
    notificationType: 'decision',
    category: 'simulation',
    titleTemplate: 'Decision en attente',
    bodyTemplate: 'Une decision attend votre choix.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.DECISION_MADE]: {
    notificationType: 'decision',
    category: 'simulation',
    titleTemplate: 'Decision prise',
    bodyTemplate: 'Votre decision a ete enregistree.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.RANDOM_EVENT_TRIGGERED]: {
    notificationType: 'event',
    category: 'simulation',
    titleTemplate: 'Alerte projet',
    bodyTemplate: 'Un evenement imprevu requiert votre attention.',
    defaultChannels: ['socket'],
    defaultPriority: 3,
  },
  [EventType.RANDOM_EVENT_RESOLVED]: {
    notificationType: 'event',
    category: 'simulation',
    titleTemplate: 'Evenement resolu',
    bodyTemplate: 'L\'evenement a ete traite.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.MEETING_STARTED]: {
    notificationType: 'meeting',
    category: 'simulation',
    titleTemplate: 'Reunion demarree',
    bodyTemplate: 'La reunion "{{data.title}}" a commence.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.KPI_UPDATED]: {
    notificationType: 'kpi',
    category: 'simulation',
    titleTemplate: 'KPIs mis a jour',
    bodyTemplate: 'Les indicateurs de la simulation ont ete mis a jour.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.MEETING_COMPLETED]: {
    notificationType: 'meeting',
    category: 'simulation',
    titleTemplate: 'Reunion terminee',
    bodyTemplate: 'La reunion "{{data.title}}" est terminee. Consultez le compte-rendu.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.MEETING_MESSAGE_SENT]: {
    notificationType: 'meeting',
    category: 'simulation',
    titleTemplate: 'Nouveau message en reunion',
    bodyTemplate: '{{data.participant}} a repondu dans la reunion.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.SIMULATION_PAUSED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Simulation en pause',
    bodyTemplate: 'Votre simulation a ete mise en pause.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.SIMULATION_RESUMED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Simulation reprise',
    bodyTemplate: 'Votre simulation a ete reprise.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.SIMULATION_ABANDONED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Simulation abandonnee',
    bodyTemplate: 'La simulation a ete abandonnee.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.SCENARIO_CREATED]: {
    notificationType: 'scenario',
    category: 'simulation',
    titleTemplate: 'Scenario cree',
    bodyTemplate: 'Le scenario "{{data.title}}" a ete cree.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.AI_MEETING_RESPONSE]: {
    notificationType: 'ai',
    category: 'simulation',
    titleTemplate: 'Reponse IA en reunion',
    bodyTemplate: '{{data.participantName}} a repondu dans la reunion.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.AI_DECISION_EVALUATED]: {
    notificationType: 'ai',
    category: 'simulation',
    titleTemplate: 'Analyse IA disponible',
    bodyTemplate: 'L\'analyse IA de votre decision est disponible.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.AI_REPORT_GENERATED]: {
    notificationType: 'ai',
    category: 'simulation',
    titleTemplate: 'Rapport IA genere',
    bodyTemplate: 'Un rapport IA a ete genere pour votre simulation.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.PMO_MESSAGE_SENT]: {
    notificationType: 'pmo',
    category: 'simulation',
    titleTemplate: 'Message PMO',
    bodyTemplate: 'Nouveau message dans la conversation PMO.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.PMO_TEMPLATE_REQUESTED]: {
    notificationType: 'pmo',
    category: 'simulation',
    titleTemplate: 'Template demande',
    bodyTemplate: 'Un template de livrable a ete demande au PMO.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.DELIVERABLE_CREATED]: {
    notificationType: 'deliverable',
    category: 'simulation',
    titleTemplate: 'Livrable cree',
    bodyTemplate: 'Le livrable "{{data.title}}" a ete cree.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.DELIVERABLE_SAVED]: {
    notificationType: 'deliverable',
    category: 'simulation',
    titleTemplate: 'Livrable sauvegarde',
    bodyTemplate: 'Le livrable "{{data.title}}" a ete sauvegarde.',
    defaultChannels: [],
    defaultPriority: 1,
  },
  [EventType.DELIVERABLE_SUBMITTED]: {
    notificationType: 'deliverable',
    category: 'simulation',
    titleTemplate: 'Livrable soumis',
    bodyTemplate: 'Le livrable "{{data.title}}" a ete soumis pour evaluation.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.DELIVERABLE_EVALUATED]: {
    notificationType: 'deliverable',
    category: 'simulation',
    titleTemplate: 'Livrable evalue',
    bodyTemplate: 'Le livrable "{{data.title}}" a ete evalue : {{data.grade}} ({{data.score}}/100).',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.DELIVERABLE_REVISED]: {
    notificationType: 'deliverable',
    category: 'simulation',
    titleTemplate: 'Livrable en revision',
    bodyTemplate: 'Le livrable "{{data.title}}" est de nouveau en mode edition (revision {{data.revisionNumber}}).',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.DELIVERABLE_VALIDATED]: {
    notificationType: 'deliverable',
    category: 'simulation',
    titleTemplate: 'Livrable valide',
    bodyTemplate: 'Le livrable "{{data.title}}" a ete valide.',
    defaultChannels: ['socket'],
    defaultPriority: 2,
  },
  [EventType.PROJECT_TEAM_UPDATED]: {
    notificationType: 'project',
    category: 'simulation',
    titleTemplate: 'Equipe projet mise a jour',
    bodyTemplate: 'L\'equipe du projet a ete modifiee.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.PROJECT_DELIVERABLE_UPDATED]: {
    notificationType: 'project',
    category: 'simulation',
    titleTemplate: 'Livrable mis a jour',
    bodyTemplate: 'Un livrable du projet a ete mis a jour.',
    defaultChannels: ['socket'],
    defaultPriority: 1,
  },
  [EventType.SIMULATION_PHASE_COMPLETED]: {
    notificationType: 'simulation',
    category: 'simulation',
    titleTemplate: 'Phase terminee',
    bodyTemplate: 'La phase "{{data.phaseName}}" est terminee. Consultez votre bilan.',
    defaultChannels: ['socket', 'email'],
    defaultPriority: 2,
  },
  [EventType.KPI_CRITICAL]: {
    notificationType: 'kpi',
    category: 'simulation',
    titleTemplate: 'KPI critique',
    bodyTemplate: 'Attention : {{data.kpiName}} est passe sous le seuil critique ({{data.value}}%).',
    defaultChannels: ['socket'],
    defaultPriority: 3,
  },
};

export const CONSUMER_NAMES = ['socket-io', 'notifier', 'audit'] as const;
export type ConsumerName = (typeof CONSUMER_NAMES)[number];
