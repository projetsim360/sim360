import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentPublicController } from './recruitment-public.controller';
import { RecruitmentService } from './services/recruitment.service';
import { RecruitmentScenarioService } from './services/recruitment-scenario.service';
import { CandidateReportService } from './services/candidate-report.service';
import { RecruitmentJoinService } from './services/recruitment-join.service';

@Module({
  imports: [CoreModule, AiModule],
  controllers: [RecruitmentController, RecruitmentPublicController],
  providers: [
    RecruitmentService,
    RecruitmentScenarioService,
    CandidateReportService,
    RecruitmentJoinService,
  ],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
