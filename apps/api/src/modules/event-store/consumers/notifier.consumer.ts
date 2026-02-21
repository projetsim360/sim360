import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { EventType } from '../types/event.types';
import {
  IEventConsumer,
  getMetadata,
  getReceivers,
  hasChannel,
  interpolateTemplate,
  getNotificationConfig,
} from './base.consumer';

@Injectable()
export class NotifierConsumer implements IEventConsumer {
  readonly name = 'notifier';
  private readonly logger = new Logger(NotifierConsumer.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  shouldProcess(event: DomainEvent): boolean {
    return event.type !== EventType.NOTIFICATION_READ;
  }

  async process(event: DomainEvent): Promise<void> {
    const meta = getMetadata(event);
    const config = getNotificationConfig(event.type);
    if (!config) return;

    const receivers = getReceivers(event);
    if (receivers.length === 0) return;

    const title = interpolateTemplate(config.titleTemplate, event);
    const body = interpolateTemplate(config.bodyTemplate, event);

    // Create in-app notifications
    for (const userId of receivers) {
      await this.prisma.notification.create({
        data: {
          eventId: event.id,
          type: config.notificationType,
          category: config.category,
          title,
          body,
          data: event.data as any,
          priority: meta.priority ?? config.defaultPriority,
          userId,
          tenantId: meta.tenantId ?? '',
        },
      });
    }

    // Send emails if channel includes email
    if (hasChannel(event, 'email')) {
      for (const userId of receivers) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, firstName: true, notifEmail: true },
          });
          if (user?.notifEmail) {
            await this.mailService.sendNotificationEmail(user.email, user.firstName, title, body);
          }
        } catch (error) {
          this.logger.warn(`Failed to send email to user ${userId}: ${error}`);
        }
      }
    }
  }
}
