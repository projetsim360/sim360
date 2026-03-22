import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, CurrentUser, CurrentTenant, Roles, Auditable } from '@sim360/core';
import { UserRole, Difficulty, Sector, TenantPlan, ScenarioType } from '@prisma/client';
import { ScenariosService } from '../services/scenarios.service';
import { CreateScenarioDto } from '../dto/create-scenario.dto';
import { UpdateScenarioDto } from '../dto/update-scenario.dto';
import { GenerateScenarioDto } from '../dto/generate-scenario.dto';

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
  @ApiQuery({ name: 'scenarioType', enum: ScenarioType, required: false })
  findAll(
    @Query('sector') sector?: Sector,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('plan') plan?: TenantPlan,
    @Query('scenarioType') scenarioType?: ScenarioType,
  ) {
    return this.scenariosService.findAll({ sector, difficulty, plan, scenarioType });
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Scenarios recommandes selon le profil' })
  getRecommended(@CurrentUser('id') userId: string, @Query('limit') limit?: string) {
    return this.scenariosService.getRecommended(userId, limit ? parseInt(limit, 10) : 5);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un scenario' })
  findOne(@Param('id') id: string) {
    return this.scenariosService.findOne(id);
  }

  @Post('generate')
  @Roles(UserRole.MEMBER, UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Auditable('SCENARIO_GENERATE', 'Scenario')
  @ApiOperation({ summary: 'Generer un scenario via IA depuis le profil ou un projet custom' })
  generateScenario(
    @Body() dto: GenerateScenarioDto,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.scenariosService.generateWithAi(user.id, tenantId, dto);
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
