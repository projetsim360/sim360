import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { AdminReferenceModule } from '../admin-reference/admin-reference.module';
import { ProfileModule } from '../profile/profile.module';
import { DeliverablesController } from './controllers';
import { DeliverablesService, DeliverableEvaluationService, TemplateResolverService } from './services';

@Module({
  imports: [CoreModule, AiModule, AdminReferenceModule, ProfileModule],
  controllers: [DeliverablesController],
  providers: [DeliverablesService, DeliverableEvaluationService, TemplateResolverService],
  exports: [DeliverablesService, DeliverableEvaluationService, TemplateResolverService],
})
export class DeliverablesModule {}
