import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /** Liveness probe — always returns OK if the process is running */
  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness check (no dependencies)' })
  live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Readiness probe — checks database connectivity */
  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check (database)' })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }
}
