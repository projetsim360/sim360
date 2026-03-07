import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { ScenariosController } from './controllers/scenarios.controller';
import { SimulationsController } from './controllers/simulations.controller';
import { ProjectsController } from './controllers/projects.controller';
import { ScenariosService } from './services/scenarios.service';
import { SimulationsService } from './services/simulations.service';
import { ProjectsService } from './services/projects.service';
import { KpiEngineService } from './services/kpi-engine.service';
import { SimulatedEmailsModule } from '../simulated-emails/simulated-emails.module';
import { ProfileModule } from '../profile/profile.module';

@Module({
  imports: [CoreModule, forwardRef(() => SimulatedEmailsModule), ProfileModule],
  controllers: [ScenariosController, SimulationsController, ProjectsController],
  providers: [ScenariosService, SimulationsService, ProjectsService, KpiEngineService],
  exports: [ScenariosService, SimulationsService, ProjectsService, KpiEngineService],
})
export class SimulationsModule {}
