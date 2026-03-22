import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { HandoverService } from './handover.service';

@Module({
  imports: [CoreModule, forwardRef(() => AiModule)],
  controllers: [MeetingsController],
  providers: [MeetingsService, HandoverService],
  exports: [MeetingsService, HandoverService],
})
export class MeetingsModule {}
