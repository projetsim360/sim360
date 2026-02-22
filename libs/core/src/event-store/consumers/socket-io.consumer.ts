import { Injectable } from '@nestjs/common';
import { DomainEvent } from '@prisma/client';
import { NotificationGateway } from '../../notifications/notification.gateway';
import {
  IEventConsumer,
  getMetadata,
  getReceivers,
  hasChannel,
  interpolateTemplate,
  getNotificationConfig,
} from './base.consumer';

@Injectable()
export class SocketIOConsumer implements IEventConsumer {
  readonly name = 'socket-io';

  constructor(private gateway: NotificationGateway) {}

  shouldProcess(event: DomainEvent): boolean {
    return hasChannel(event, 'socket');
  }

  async process(event: DomainEvent): Promise<void> {
    const meta = getMetadata(event);
    const config = getNotificationConfig(event.type);
    const receivers = getReceivers(event);

    if (receivers.length === 0) return;

    const payload = {
      eventId: event.id,
      eventType: event.type,
      title: config ? interpolateTemplate(config.titleTemplate, event) : event.type,
      body: config ? interpolateTemplate(config.bodyTemplate, event) : '',
      data: event.data,
      actor: { id: meta.actorId, name: meta.actorName },
      priority: meta.priority ?? 1,
      timestamp: event.occurredAt.toISOString(),
    };

    this.gateway.emitToUsers(receivers, 'notification:new', payload);
  }
}
