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
import { PmoModule } from './modules/pmo/pmo.module';
import { DeliverablesModule } from './modules/deliverables/deliverables.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SimulatedEmailsModule } from './modules/simulated-emails/simulated-emails.module';
import { ValorizationModule } from './modules/valorization/valorization.module';
import { ContactModule } from './modules/contact/contact.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { MentoringModule } from './modules/mentoring/mentoring.module';
import { ActionItemsModule } from './modules/action-items/action-items.module';
import { PlansModule } from './modules/plans/plans.module';
import { BillingModule } from './modules/billing';

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
    PmoModule,
    DeliverablesModule,
    ProfileModule,
    SimulatedEmailsModule,
    ValorizationModule,
    ContactModule,
    RecruitmentModule,
    MentoringModule,
    ActionItemsModule,
    PlansModule,
    BillingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
