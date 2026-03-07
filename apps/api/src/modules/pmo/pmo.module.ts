import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { AiModule } from '../ai/ai.module';
import { AdminReferenceModule } from '../admin-reference/admin-reference.module';
import { ProfileModule } from '../profile/profile.module';
import { PmoController } from './controllers';
import { PmoService, PmoContextService } from './services';

@Module({
  imports: [CoreModule, AiModule, AdminReferenceModule, ProfileModule],
  controllers: [PmoController],
  providers: [PmoService, PmoContextService],
  exports: [PmoService, PmoContextService],
})
export class PmoModule {}
