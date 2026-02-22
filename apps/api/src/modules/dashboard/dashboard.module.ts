import { Module } from '@nestjs/common';
import { CoreModule } from '@sim360/core';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [CoreModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
