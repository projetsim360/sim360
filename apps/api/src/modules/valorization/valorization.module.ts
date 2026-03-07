import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { ValorizationController, BadgesController } from './controllers';
import { DebriefingService, PortfolioService, BadgeService, CvSuggestionService } from './services';

@Module({
  imports: [CoreModule, AiModule],
  controllers: [ValorizationController, BadgesController],
  providers: [DebriefingService, PortfolioService, BadgeService, CvSuggestionService],
  exports: [DebriefingService, PortfolioService, BadgeService, CvSuggestionService],
})
export class ValorizationModule {}
