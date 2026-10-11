import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sim360/core';
import { SendContactMessageDto } from './dto';
import { normalizeMessage, spamVerdict } from './contact.util';

export const DEFAULT_CONTACT_EMAIL = 'hello@simex.pro';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  /** Where contact messages land: `CONTACT_EMAIL`, else the sender address, else the default inbox. */
  private get recipient(): string {
    return this.config.get<string>('CONTACT_EMAIL', '') || this.config.get<string>('SMTP_FROM', '') || DEFAULT_CONTACT_EMAIL;
  }

  /**
   * Forwards a visitor's message by email. Spam is dropped silently: the caller still gets a
   * success response, so automated senders cannot tell what was filtered.
   */
  async submit(dto: SendContactMessageDto, ip?: string): Promise<{ received: true }> {
    const verdict = spamVerdict(dto);
    if (verdict !== 'ok') {
      this.logger.warn(`Contact message dropped (${verdict}) from ${ip ?? 'unknown ip'}`);
      return { received: true };
    }

    await this.mail.sendContactMessage({
      to: this.recipient,
      name: dto.name,
      email: dto.email,
      message: normalizeMessage(dto.message),
      locale: dto.locale ?? 'fr',
      page: dto.page,
    });
    this.logger.log(`Contact message forwarded to ${this.recipient} (${dto.locale ?? 'fr'})`);
    return { received: true };
  }
}
