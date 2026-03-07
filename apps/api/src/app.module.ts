import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {
  CoreModule,
  appConfig,
  dbConfig,
  redisConfig,
  authConfig,
  storageConfig,
  notificationConfig,
} from '@sim360/core';
import { aiConfig } from './config/ai.config';
import { AiModule } from './modules/ai/ai.module';
import { SimulationsModule } from './modules/simulations/simulations.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminReferenceModule } from './modules/admin-reference/admin-reference.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, redisConfig, authConfig, storageConfig, notificationConfig, aiConfig],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    CoreModule,
    AiModule,
    SimulationsModule,
    MeetingsModule,
    DashboardModule,
    AdminReferenceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
