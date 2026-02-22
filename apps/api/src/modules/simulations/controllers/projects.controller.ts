import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant } from '@sim360/core';
import { ProjectsService } from '../services/projects.service';
import { UpdateDeliverableDto } from '../dto/update-deliverable.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes projets' })
  findAll(@CurrentUser('id') userId: string, @CurrentTenant() tenantId: string) {
    return this.projectsService.findAll(userId, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un projet' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @Get(':id/team')
  @ApiOperation({ summary: 'Equipe du projet' })
  getTeam(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.getTeam(id, userId);
  }

  @Get(':id/deliverables')
  @ApiOperation({ summary: 'Livrables du projet' })
  getDeliverables(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.getDeliverables(id, userId);
  }

  @Patch(':id/deliverables/:delId')
  @ApiOperation({ summary: 'Mettre a jour un livrable' })
  updateDeliverable(
    @Param('id') id: string,
    @Param('delId') delId: string,
    @Body() dto: UpdateDeliverableDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.updateDeliverable(id, delId, userId, dto);
  }
}
