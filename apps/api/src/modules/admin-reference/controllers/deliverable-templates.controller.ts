import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Roles } from '@sim360/core';
import { UserRole, PhaseType, DeliverableTemplateDifficulty } from '@prisma/client';
import { DeliverableTemplatesService } from '../services';
import { CreateDeliverableTemplateDto, UpdateDeliverableTemplateDto } from '../dto';

@ApiTags('Admin - Deliverable Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/deliverable-templates')
export class DeliverableTemplatesController {
  constructor(private readonly service: DeliverableTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Creer un template de livrable (US-1.1)' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDeliverableTemplateDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un template de livrable avec versioning (US-1.2)' })
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDeliverableTemplateDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Activer/desactiver un template de livrable (US-1.3)' })
  toggle(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.service.toggle(tenantId, userId, id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les templates de livrables avec filtres et pagination (US-1.4)' })
  @ApiQuery({ name: 'phase', enum: PhaseType, required: false })
  @ApiQuery({ name: 'type', required: false, description: 'Type de livrable (charter, wbs, etc.)' })
  @ApiQuery({ name: 'difficulty', enum: DeliverableTemplateDifficulty, required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Colonne de tri (title, phase, type, difficulty, createdAt, updatedAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('phase') phase?: PhaseType,
    @Query('type') type?: string,
    @Query('difficulty') difficulty?: DeliverableTemplateDifficulty,
    @Query('isActive') isActive?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.service.findAll(tenantId, {
      phase,
      type,
      difficulty,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un template de livrable' })
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Historique des versions d\'un template de livrable' })
  findVersions(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findVersions(tenantId, id);
  }
}
