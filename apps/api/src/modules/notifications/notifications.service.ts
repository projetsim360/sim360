import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { PaginatedNotificationsDto, UnreadCountDto } from './dto/notification-response.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    tenantId: string,
    query: ListNotificationsDto,
  ): Promise<PaginatedNotificationsDto> {
    const { page = 1, limit = 20, type, category, unreadOnly } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      tenantId,
      archivedAt: null,
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (unreadOnly) where.readAt = null;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async getUnreadCount(userId: string, tenantId: string): Promise<UnreadCountDto> {
    const count = await this.prisma.notification.count({
      where: { userId, tenantId, readAt: null, archivedAt: null },
    });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string, tenantId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, tenantId, readAt: null },
      data: { readAt: new Date() },
    });
    return { count: result.count };
  }

  async archive(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  async bulkArchive(ids: string[], userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id: { in: ids }, userId },
      data: { archivedAt: new Date() },
    });
    return { count: result.count };
  }
}
