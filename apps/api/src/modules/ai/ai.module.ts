import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import {
  MeetingAiService,
  DecisionAiService,
  FeedbackAiService,
  EventAiService,
  AiOrchestratorService,
  TokenTrackerService,
} from './services';
import { SimulationsModule } from '../simulations/simulations.module';

@Module({
  imports: [CoreModule, SimulationsModule],
  controllers: [AiController],
  providers: [
    AiService,
    MeetingAiService,
    DecisionAiService,
    FeedbackAiService,
    EventAiService,
    AiOrchestratorService,
    TokenTrackerService,
  ],
  exports: [AiService, AiOrchestratorService, TokenTrackerService],
})
export class AiModule {}
