import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async send(dto: {
    userId: string;
    tenantId: string;
    type: 'SYSTEM' | 'ALERT' | 'INFO' | 'ACTION_REQUIRED';
    channels: ('EMAIL' | 'PUSH' | 'IN_APP')[];
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    for (const channel of dto.channels) {
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          tenantId: dto.tenantId,
          type: dto.type,
          channel,
          title: dto.title,
          body: dto.body,
          data: (dto.data as any) ?? undefined,
        },
      });

      await this.notificationQueue.add(`send-${channel.toLowerCase()}`, {
        notificationId: notification.id,
        channel,
      });
    }

    this.logger.log(`Queued notification for user ${dto.userId} on channels: ${dto.channels.join(', ')}`);
  }

  async findAll(userId: string, tenantId: string) {
    return this.prisma.notification.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }
}
