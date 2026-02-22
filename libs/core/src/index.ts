// Core module
export { CoreModule } from './core.module';

// Config
export { appConfig } from './config/app.config';
export { authConfig } from './config/auth.config';
export { dbConfig } from './config/db.config';
export { redisConfig } from './config/redis.config';
export { storageConfig } from './config/storage.config';
export { notificationConfig } from './config/notification.config';

// Prisma
export { PrismaModule } from './prisma/prisma.module';
export { PrismaService } from './prisma/prisma.service';

// Cache
export { RedisCacheModule } from './cache/redis-cache.module';
export { RedisCacheService } from './cache/redis-cache.service';

// Auth
export { AuthModule } from './auth/auth.module';
export { AuthService } from './auth/auth.service';
export { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
export { RolesGuard } from './auth/guards/roles.guard';
export { GoogleAuthGuard } from './auth/guards/google-auth.guard';
export { JwtStrategy } from './auth/strategies/jwt.strategy';
export { GoogleStrategy } from './auth/strategies/google.strategy';

// Users
export { UsersModule } from './users/users.module';
export { UsersService } from './users/users.service';

// Tenants
export { TenantsModule } from './tenants/tenants.module';
export { TenantsService } from './tenants/tenants.service';

// Event Store
export { EventStoreModule } from './event-store/event-store.module';
export { EventPublisherService } from './event-store/services/event-publisher.service';
export { EventStoreService } from './event-store/services/event-store.service';
export {
  EventType,
  AggregateType,
  EVENT_NOTIFICATION_CONFIG,
  CONSUMER_NAMES,
} from './event-store/types/event.types';
export type {
  ChannelType,
  DomainEventMetadata,
  EventPublishContext,
  EventNotificationConfig,
  ConsumerName,
} from './event-store/types/event.types';

// Notifications
export { NotificationsModule } from './notifications/notifications.module';
export { NotificationsService } from './notifications/notifications.service';
export { NotificationGateway } from './notifications/notification.gateway';

// Audit
export { AuditModule } from './audit/audit.module';
export { AuditService } from './audit/audit.service';

// Mail
export { MailModule } from './mail/mail.module';
export { MailService } from './mail/mail.service';

// Storage
export { StorageModule } from './storage/storage.module';
export { StorageService } from './storage/storage.service';

// Health
export { HealthModule } from './health/health.module';

// Common - Decorators
export {
  CurrentUser,
  CurrentTenant,
  Public,
  IS_PUBLIC_KEY,
  Roles,
  ROLES_KEY,
  Auditable,
  AUDITABLE_KEY,
  Cacheable,
  CacheEvict,
} from './common/decorators';
export type { AuditableOptions } from './common/decorators/auditable.decorator';

// Common - Filters
export { GlobalExceptionFilter } from './common/filters';

// Common - Interceptors
export { TransformInterceptor } from './common/interceptors';
export { AuditInterceptor } from './common/interceptors';

// Common - Middleware
export { LoggerMiddleware } from './common/middleware';

// Common - Utils
export { encrypt, decrypt } from './common/utils/crypto.util';
