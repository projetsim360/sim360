import { Injectable } from '@nestjs/common';
import { EventStoreService } from './event-store.service';
import {
  EventType,
  AggregateType,
  EventPublishContext,
  EVENT_NOTIFICATION_CONFIG,
  ChannelType,
} from '../types/event.types';

@Injectable()
export class EventPublisherService {
  constructor(private eventStore: EventStoreService) {}

  async publish(
    type: EventType,
    aggregateType: AggregateType,
    aggregateId: string,
    data: Record<string, unknown>,
    context: EventPublishContext,
  ): Promise<string> {
    const config = EVENT_NOTIFICATION_CONFIG[type];
    const channels: ChannelType[] = context.channels ?? config?.defaultChannels ?? ['socket'];
    const priority = context.priority ?? config?.defaultPriority ?? 1;

    const metadata = {
      actorId: context.actorId,
      actorType: context.actorType ?? 'user',
      actorName: context.actorName,
      tenantId: context.tenantId,
      receiverIds: context.receiverIds,
      excludeActorFromReceivers: context.excludeActorFromReceivers,
      channels,
      priority,
      ip: context.ip,
      userAgent: context.userAgent,
    };

    return this.eventStore.append({
      type,
      aggregateType,
      aggregateId,
      data,
      metadata,
      tenantId: context.tenantId,
      occurredAt: new Date(),
    });
  }
}
