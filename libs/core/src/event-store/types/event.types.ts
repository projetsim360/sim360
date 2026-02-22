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
}

export enum AggregateType {
  USER = 'User',
  TENANT = 'Tenant',
  NOTIFICATION = 'Notification',
  AUTH = 'Auth',
  SYSTEM = 'System',
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
};

export const CONSUMER_NAMES = ['socket-io', 'notifier', 'audit'] as const;
export type ConsumerName = (typeof CONSUMER_NAMES)[number];
