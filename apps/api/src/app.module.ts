import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { appConfig } from './config/app.config';
import { dbConfig } from './config/db.config';
import { redisConfig } from './config/redis.config';
import { authConfig } from './config/auth.config';
import { storageConfig } from './config/storage.config';
import { aiConfig } from './config/ai.config';
import { notificationConfig } from './config/notification.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, redisConfig, authConfig, storageConfig, aiConfig, notificationConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    StorageModule,
    NotificationsModule,
    AiModule,
    HealthModule,
  ],
})
export class AppModule {}
