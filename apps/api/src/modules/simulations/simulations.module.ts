import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { ScenariosController } from './controllers/scenarios.controller';
import { ScenariosPublicController } from './controllers/scenarios-public.controller';
import { SimulationsController } from './controllers/simulations.controller';
import { ProjectsController } from './controllers/projects.controller';
import { ScenariosService } from './services/scenarios.service';
import { SimulationsService } from './services/simulations.service';
import { ProjectsService } from './services/projects.service';
import { KpiEngineService } from './services/kpi-engine.service';
import { BrownfieldContextService } from './services/brownfield-context.service';
import { StakeholderIdentificationService } from './services/stakeholder-identification.service';
import { SimulatedEmailsModule } from '../simulated-emails/simulated-emails.module';
import { ProfileModule } from '../profile/profile.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { AiModule } from '../ai/ai.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [CoreModule, forwardRef(() => SimulatedEmailsModule), forwardRef(() => AiModule), ProfileModule, MeetingsModule, PlansModule],
  controllers: [ScenariosController, ScenariosPublicController, SimulationsController, ProjectsController],
  providers: [ScenariosService, SimulationsService, ProjectsService, KpiEngineService, BrownfieldContextService, StakeholderIdentificationService],
  exports: [ScenariosService, SimulationsService, ProjectsService, KpiEngineService, BrownfieldContextService, StakeholderIdentificationService],
})
export class SimulationsModule {}
