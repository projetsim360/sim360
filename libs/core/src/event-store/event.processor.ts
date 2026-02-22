import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventStoreService } from './services/event-store.service';
import { SocketIOConsumer } from './consumers/socket-io.consumer';
import { NotifierConsumer } from './consumers/notifier.consumer';
import { AuditConsumer } from './consumers/audit.consumer';
import { IEventConsumer } from './consumers/base.consumer';

@Processor('events')
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);
  private readonly consumers: IEventConsumer[];

  constructor(
    private eventStore: EventStoreService,
    socketIO: SocketIOConsumer,
    notifier: NotifierConsumer,
    audit: AuditConsumer,
  ) {
    super();
    this.consumers = [socketIO, notifier, audit];
  }

  async process(job: Job<{ eventId: string }>) {
    const { eventId } = job.data;
    const event = await this.eventStore.findById(eventId);

    if (!event) {
      this.logger.warn(`Event ${eventId} not found`);
      return;
    }

    for (const consumer of this.consumers) {
      try {
        if (!consumer.shouldProcess(event)) {
          await this.eventStore.markAsProcessed(eventId, consumer.name);
          continue;
        }
        await consumer.process(event);
        await this.eventStore.markAsProcessed(eventId, consumer.name);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Consumer ${consumer.name} failed for event ${eventId}: ${message}`);
        await this.eventStore.markAsFailed(eventId, consumer.name, message);
      }
    }
  }
}
