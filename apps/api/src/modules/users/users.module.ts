import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from '../storage/storage.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [StorageModule, MailModule, JwtModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
