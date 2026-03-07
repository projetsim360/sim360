import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Roles, Public } from '@sim360/core';
import { UserRole, ReferenceDocumentCategory, PhaseType } from '@prisma/client';
import { ReferenceDocumentsService } from '../services';
import { CreateReferenceDocumentDto, UpdateReferenceDocumentDto } from '../dto';

@ApiTags('Admin - Reference Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/reference-documents')
export class ReferenceDocumentsController {
  constructor(private readonly service: ReferenceDocumentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Creer un document de reference (US-1.6)' })
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReferenceDocumentDto,
  ) {
    return this.service.create(tenantId, userId, dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Modifier un document de reference avec versioning (US-1.7)' })
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReferenceDocumentDto,
  ) {
    return this.service.update(tenantId, userId, id, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Lister les documents de reference avec filtres et recherche (US-1.8)' })
  @ApiQuery({ name: 'category', enum: ReferenceDocumentCategory, required: false })
  @ApiQuery({ name: 'phase', enum: PhaseType, required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche textuelle sur le titre' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Colonne de tri' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('category') category?: ReferenceDocumentCategory,
    @Query('phase') phase?: PhaseType,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.service.findAll(tenantId, {
      category,
      phase,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Detail d\'un document de reference' })
  findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Get(':id/versions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Historique des versions d\'un document de reference' })
  findVersions(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.service.findVersions(tenantId, id);
  }
}

/**
 * Separate controller for the public glossary endpoint (US-1.9).
 * Mounted at /reference-documents/glossary (no /admin prefix).
 */
@ApiTags('Reference Documents - Public')
@Controller('reference-documents')
export class GlossaryController {
  constructor(private readonly service: ReferenceDocumentsService) {}

  @Get('glossary')
  @Public()
  @ApiOperation({
    summary: 'Glossaire PMI public pour tooltips frontend (US-1.9)',
    description: 'Retourne les entrees GLOSSARY actives avec term, content (definition) et example.',
  })
  findGlossary() {
    return this.service.findGlossary();
  }
}
