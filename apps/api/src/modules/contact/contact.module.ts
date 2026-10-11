import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

/** Public contact form of the marketing site: no authentication, rate-limited, forwarded by email. */
@Module({
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
