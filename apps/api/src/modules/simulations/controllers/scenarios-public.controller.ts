import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@sim360/core';
import { ScenariosService } from '../services/scenarios.service';

/**
 * Public catalogue of the marketing site. Lives under `public/` so it never collides with
 * the authenticated `scenarios/:id` route.
 */
@ApiTags('Public')
@Controller('public/scenarios')
export class ScenariosPublicController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Published scenarios, public fields only (cached)' })
  list() {
    return this.scenariosService.findPublicCatalogue();
  }
}
