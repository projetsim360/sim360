import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { IEventConsumer, getMetadata } from './base.consumer';

@Injectable()
export class AuditConsumer implements IEventConsumer {
  readonly name = 'audit';
  private readonly logger = new Logger(AuditConsumer.name);

  constructor(private prisma: PrismaService) {}

  shouldProcess(): boolean {
    return true;
  }

  async process(event: DomainEvent): Promise<void> {
    const meta = getMetadata(event);
    const data = event.data as Record<string, unknown>;

    await this.prisma.auditLog.create({
      data: {
        action: event.type,
        entity: event.aggregateType,
        entityId: event.aggregateId,
        userId: meta.actorType === 'user' ? meta.actorId : null,
        tenantId: meta.tenantId ?? null,
        ip: (meta as any).ip ?? null,
        userAgent: (meta as any).userAgent ?? null,
        metadata: event.data as any,
        oldValue: data.oldValue as any ?? null,
        newValue: data.newValue as any ?? null,
        success: true,
      },
    });

    this.logger.debug(`Audit log created for event ${event.type}`);
  }
}
