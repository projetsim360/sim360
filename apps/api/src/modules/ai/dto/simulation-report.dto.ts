import { IsString, IsIn, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SimulationReportDto {
  @ApiProperty()
  @IsString()
  simulationId!: string;

  @ApiProperty({ enum: ['phase', 'final'] })
  @IsIn(['phase', 'final'])
  type!: 'phase' | 'final';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  phaseOrder?: number;
}
