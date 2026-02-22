import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { MailModule } from './mail/mail.module';
import { EventStoreModule } from './event-store/event-store.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
    RedisCacheModule,
    MailModule,
    EventStoreModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    StorageModule,
    NotificationsModule,
    AuditModule,
    HealthModule,
  ],
  exports: [
    PrismaModule,
    RedisCacheModule,
    MailModule,
    EventStoreModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    StorageModule,
    NotificationsModule,
    AuditModule,
    HealthModule,
  ],
})
export class CoreModule {}
