import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import {
  DeliverableTemplatesController,
  ReferenceDocumentsController,
  GlossaryController,
} from './controllers';
import {
  DeliverableTemplatesService,
  ReferenceDocumentsService,
} from './services';

@Module({
  imports: [CoreModule],
  controllers: [
    DeliverableTemplatesController,
    ReferenceDocumentsController,
    GlossaryController,
  ],
  providers: [
    DeliverableTemplatesService,
    ReferenceDocumentsService,
  ],
  exports: [
    DeliverableTemplatesService,
    ReferenceDocumentsService,
  ],
})
export class AdminReferenceModule {}
