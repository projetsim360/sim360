import { Module, forwardRef } from '@nestjs/common';
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
  ScenarioGenerationAiService,
} from './services';
import { SimulationsModule } from '../simulations/simulations.module';

@Module({
  imports: [CoreModule, forwardRef(() => SimulationsModule)],
  controllers: [AiController],
  providers: [
    AiService,
    MeetingAiService,
    DecisionAiService,
    FeedbackAiService,
    EventAiService,
    AiOrchestratorService,
    TokenTrackerService,
    ScenarioGenerationAiService,
  ],
  exports: [AiService, AiOrchestratorService, TokenTrackerService, ScenarioGenerationAiService],
})
export class AiModule {}
