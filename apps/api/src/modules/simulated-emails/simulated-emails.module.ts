import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { SimulatedEmailsController } from './controllers';
import { SimulatedEmailsService, EmailGeneratorService } from './services';

@Module({
  imports: [CoreModule, forwardRef(() => AiModule)],
  controllers: [SimulatedEmailsController],
  providers: [SimulatedEmailsService, EmailGeneratorService],
  exports: [SimulatedEmailsService],
})
export class SimulatedEmailsModule {}
