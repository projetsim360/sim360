import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, Roles } from '@sim360/core';
import { UserRole, Difficulty, Sector, TenantPlan } from '@prisma/client';
import { ScenariosService } from '../services/scenarios.service';
import { CreateScenarioDto } from '../dto/create-scenario.dto';
import { UpdateScenarioDto } from '../dto/update-scenario.dto';

@ApiTags('Scenarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scenarios')
export class ScenariosController {
  constructor(private scenariosService: ScenariosService) {}

  @Get()
  @ApiOperation({ summary: 'Catalogue de scenarios' })
  @ApiQuery({ name: 'sector', enum: Sector, required: false })
  @ApiQuery({ name: 'difficulty', enum: Difficulty, required: false })
  findAll(
    @Query('sector') sector?: Sector,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('plan') plan?: TenantPlan,
  ) {
    return this.scenariosService.findAll({ sector, difficulty, plan });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un scenario' })
  findOne(@Param('id') id: string) {
    return this.scenariosService.findOne(id);
  }

  @Post()
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Creer un scenario' })
  create(@Body() dto: CreateScenarioDto, @CurrentUser('id') userId: string) {
    return this.scenariosService.create(userId, dto);
  }

  @Put(':id')
  @Roles(UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Modifier un scenario' })
  update(@Param('id') id: string, @Body() dto: UpdateScenarioDto) {
    return this.scenariosService.update(id, dto);
  }
}
