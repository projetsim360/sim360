import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { CONSUMER_NAMES, DomainEventMetadata } from '../types/event.types';

@Injectable()
export class EventStoreService {
  private readonly logger = new Logger(EventStoreService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('events') private eventQueue: Queue,
  ) {}

  async append(event: {
    type: string;
    aggregateType: string;
    aggregateId: string;
    data: Record<string, unknown>;
    metadata: DomainEventMetadata;
    tenantId?: string;
    occurredAt: Date;
  }): Promise<string> {
    const domainEvent = await this.prisma.domainEvent.create({
      data: {
        type: event.type,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        data: event.data as any,
        metadata: event.metadata as any,
        tenantId: event.tenantId,
        occurredAt: event.occurredAt,
        consumers: {
          create: CONSUMER_NAMES.map((name) => ({
            consumerName: name,
            status: 'PENDING',
          })),
        },
      },
    });

    await this.eventQueue.add(
      'process-event',
      { eventId: domainEvent.id },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(`Event ${event.type} appended: ${domainEvent.id}`);
    return domainEvent.id;
  }

  async findById(id: string) {
    return this.prisma.domainEvent.findUnique({
      where: { id },
      include: { consumers: true },
    });
  }

  async findByAggregate(aggregateType: string, aggregateId: string) {
    return this.prisma.domainEvent.findMany({
      where: { aggregateType, aggregateId },
      orderBy: { occurredAt: 'desc' },
      include: { consumers: true },
    });
  }

  async markAsProcessed(eventId: string, consumerName: string) {
    await this.prisma.domainEventConsumer.update({
      where: { eventId_consumerName: { eventId, consumerName } },
      data: { status: 'COMPLETED', processedAt: new Date() },
    });
  }

  async markAsFailed(eventId: string, consumerName: string, error: string) {
    await this.prisma.domainEventConsumer.update({
      where: { eventId_consumerName: { eventId, consumerName } },
      data: {
        status: 'FAILED',
        errorMessage: error,
        retryCount: { increment: 1 },
      },
    });
  }
}
