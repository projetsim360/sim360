import { Body, Controller, HttpCode, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '@sim360/core';
import { ContactService } from './contact.service';
import { SendContactMessageDto } from './dto';

@ApiTags('Public')
@Controller('public/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @Public()
  @HttpCode(202)
  // 5 messages per hour per IP on top of the global tiers.
  @Throttle({ long: { ttl: 3_600_000, limit: 5 } })
  @ApiOperation({ summary: 'Send a message through the public contact form' })
  send(@Body() dto: SendContactMessageDto, @Ip() ip: string) {
    return this.contactService.submit(dto, ip);
  }
}
