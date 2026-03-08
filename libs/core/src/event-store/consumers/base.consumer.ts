import { DomainEvent } from '@prisma/client';
import {
  DomainEventMetadata,
  EVENT_NOTIFICATION_CONFIG,
  EventType,
  ChannelType,
} from '../types/event.types';

export interface IEventConsumer {
  readonly name: string;
  process(event: DomainEvent): Promise<void>;
  shouldProcess(event: DomainEvent): boolean;
}

export function getMetadata(event: DomainEvent): DomainEventMetadata {
  return event.metadata as unknown as DomainEventMetadata;
}

export function getReceivers(event: DomainEvent): string[] {
  const meta = getMetadata(event);
  let receivers = meta.receiverIds ?? [];
  if (meta.excludeActorFromReceivers) {
    receivers = receivers.filter((id) => id !== meta.actorId);
  }
  return receivers;
}

export function hasChannel(event: DomainEvent, channel: ChannelType): boolean {
  const meta = getMetadata(event);
  return meta.channels?.includes(channel) ?? false;
}

export function interpolateTemplate(
  template: string,
  event: DomainEvent,
): string {
  const meta = getMetadata(event);
  const data = event.data as Record<string, unknown>;
  return template
    .replace(/\{\{actorName\}\}/g, meta.actorName ?? 'Utilisateur')
    .replace(/\{\{aggregateId\}\}/g, event.aggregateId)
    .replace(/\{\{data\.(\w+)\}\}/g, (_, key) => String(data[key] ?? ''))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
}

export function getNotificationConfig(eventType: string) {
  return EVENT_NOTIFICATION_CONFIG[eventType as EventType];
}
