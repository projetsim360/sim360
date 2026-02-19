import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('signed-url')
  @ApiOperation({ summary: 'Get signed upload URL' })
  getSignedUrl(@Body() dto: { filename: string; mimeType: string }) {
    return this.storageService.getSignedUploadUrl(dto.filename, dto.mimeType);
  }
}
