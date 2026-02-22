import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { ScenariosController } from './controllers/scenarios.controller';
import { SimulationsController } from './controllers/simulations.controller';
import { ProjectsController } from './controllers/projects.controller';
import { ScenariosService } from './services/scenarios.service';
import { SimulationsService } from './services/simulations.service';
import { ProjectsService } from './services/projects.service';
import { KpiEngineService } from './services/kpi-engine.service';

@Module({
  imports: [CoreModule],
  controllers: [ScenariosController, SimulationsController, ProjectsController],
  providers: [ScenariosService, SimulationsService, ProjectsService, KpiEngineService],
  exports: [ScenariosService, SimulationsService, ProjectsService, KpiEngineService],
})
export class SimulationsModule {}
