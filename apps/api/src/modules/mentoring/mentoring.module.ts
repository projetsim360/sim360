import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { MentoringController } from './mentoring.controller';
import { MentorReviewService, MentoringSessionService } from './services';

@Module({
  imports: [CoreModule],
  controllers: [MentoringController],
  providers: [MentorReviewService, MentoringSessionService],
  exports: [MentorReviewService, MentoringSessionService],
})
export class MentoringModule {}
