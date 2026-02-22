import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDITABLE_KEY, AuditableOptions } from '../decorators/auditable.decorator';
import { EventPublisherService } from '../../event-store/services/event-publisher.service';
import { AggregateType, EventType } from '../../event-store/types/event.types';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private reflector: Reflector,
    private eventPublisher: EventPublisherService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditConfig = this.reflector.get<AuditableOptions>(
      AUDITABLE_KEY,
      context.getHandler(),
    );

    if (!auditConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id ?? request.user?.sub;
    const tenantId = request.user?.tenantId;
    const entityId = request.params?.id;

    return next.handle().pipe(
      tap({
        next: () => {
          this.publishAuditEvent(auditConfig, userId, tenantId, entityId, request).catch(
            (err) => this.logger.warn(`Audit event failed: ${err.message}`),
          );
        },
      }),
    );
  }

  private async publishAuditEvent(
    config: AuditableOptions,
    userId: string | undefined,
    tenantId: string | undefined,
    entityId: string | undefined,
    request: any,
  ) {
    const eventType = this.mapActionToEventType(config.action);
    if (!eventType) return;

    const aggregateType = this.mapEntityToAggregateType(config.entity);

    await this.eventPublisher.publish(
      eventType,
      aggregateType,
      entityId ?? userId ?? 'unknown',
      { action: config.action, entity: config.entity },
      {
        actorId: userId ?? 'anonymous',
        actorType: userId ? 'user' : 'system',
        tenantId,
        receiverIds: userId ? [userId] : [],
        channels: [],
        ip: request.ip,
        userAgent: request.headers?.['user-agent'],
      },
    );
  }

  private mapActionToEventType(action: string): EventType | null {
    const mapping: Record<string, EventType> = {
      'auth.register': EventType.USER_REGISTERED,
      'auth.login': EventType.USER_LOGGED_IN,
      'auth.logout': EventType.USER_LOGGED_IN,
      'auth.verify-email': EventType.USER_UPDATED,
      'auth.reset-password': EventType.PASSWORD_CHANGED,
      'auth.enable-2fa': EventType.TWO_FACTOR_ENABLED,
      'auth.disable-2fa': EventType.TWO_FACTOR_DISABLED,
      'auth.unlink-google': EventType.GOOGLE_UNLINKED,
      'user.update-profile': EventType.USER_UPDATED,
      'user.change-password': EventType.PASSWORD_CHANGED,
      'user.change-email': EventType.EMAIL_CHANGED,
      'user.delete-account': EventType.USER_DELETED,
      'user.upload-avatar': EventType.AVATAR_UPLOADED,
      'tenant.update': EventType.TENANT_UPDATED,
    };
    return mapping[action] ?? null;
  }

  private mapEntityToAggregateType(entity: string): AggregateType {
    const mapping: Record<string, AggregateType> = {
      User: AggregateType.USER,
      Auth: AggregateType.AUTH,
      Tenant: AggregateType.TENANT,
    };
    return mapping[entity] ?? AggregateType.SYSTEM;
  }
}
