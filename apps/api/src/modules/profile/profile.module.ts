import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { ProfileController } from './controllers';
import { ProfileService, ProfileAnalysisService, ProfileConfigService } from './services';

@Module({
  imports: [CoreModule, AiModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileAnalysisService, ProfileConfigService],
  exports: [ProfileService, ProfileAnalysisService, ProfileConfigService],
})
export class ProfileModule {}
