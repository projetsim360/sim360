import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
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

const RATE_LIMIT_TTL = 300; // 5 minutes in seconds

@Injectable()
export class NotifierConsumer implements IEventConsumer {
  readonly name = 'notifier';
  private readonly logger = new Logger(NotifierConsumer.name);
  private redis: Redis;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private config: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.config.get<string>('redis.host', 'localhost'),
      port: this.config.get<number>('redis.port', 6379),
      password: this.config.get<string>('redis.password') || undefined,
    });
  }

  shouldProcess(event: DomainEvent): boolean {
    return event.type !== EventType.NOTIFICATION_READ;
  }

  /**
   * Rate limit: max 1 notification of the same type per user per 5 minutes.
   * Returns true if the notification should be sent (not rate-limited).
   */
  private async isAllowed(userId: string, eventType: string): Promise<boolean> {
    const key = `notif_rate:${userId}:${eventType}`;
    const result = await this.redis.set(key, '1', 'EX', RATE_LIMIT_TTL, 'NX');
    return result === 'OK';
  }

  async process(event: DomainEvent): Promise<void> {
    const meta = getMetadata(event);
    const config = getNotificationConfig(event.type);
    if (!config) return;

    const receivers = getReceivers(event);
    if (receivers.length === 0) return;

    const title = interpolateTemplate(config.titleTemplate, event);
    const body = interpolateTemplate(config.bodyTemplate, event);

    for (const userId of receivers) {
      // Rate limit: 1 notification per type per user per 5 min
      const allowed = await this.isAllowed(userId, event.type);
      if (!allowed) {
        this.logger.debug(`Rate-limited notification ${event.type} for user ${userId}`);
        continue;
      }

      // Create in-app notification
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

      // Send email if channel includes email
      if (hasChannel(event, 'email')) {
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
