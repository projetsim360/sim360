import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { AdminReferenceModule } from '../admin-reference/admin-reference.module';
import { DeliverablesController } from './controllers';
import { DeliverablesService, DeliverableEvaluationService } from './services';

@Module({
  imports: [CoreModule, AiModule, AdminReferenceModule],
  controllers: [DeliverablesController],
  providers: [DeliverablesService, DeliverableEvaluationService],
  exports: [DeliverablesService, DeliverableEvaluationService],
})
export class DeliverablesModule {}
