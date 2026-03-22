import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventStoreService } from './services/event-store.service';
import { EventPublisherService } from './services/event-publisher.service';
import { EventProcessor } from './event.processor';
import { SocketIOConsumer } from './consumers/socket-io.consumer';
import { NotifierConsumer } from './consumers/notifier.consumer';
import { AuditConsumer } from './consumers/audit.consumer';
import { NotificationGateway } from '../notifications/notification.gateway';
import { getRedisOptions } from '../config/redis.utils';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        connection: getRedisOptions(),
      }),
    }),
    BullModule.registerQueue({ name: 'events' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtSecret'),
      }),
    }),
  ],
  providers: [
    EventStoreService,
    EventPublisherService,
    EventProcessor,
    SocketIOConsumer,
    NotifierConsumer,
    AuditConsumer,
    NotificationGateway,
  ],
  exports: [EventPublisherService, NotificationGateway],
})
export class EventStoreModule {}
