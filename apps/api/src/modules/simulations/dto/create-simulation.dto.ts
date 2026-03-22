import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSimulationDto {
  @ApiProperty({ description: 'ID du scenario a instancier' })
  @IsString()
  scenarioId!: string;

  @ApiPropertyOptional({
    description: 'Phase de depart (0 par defaut). Pour les scenarios Brownfield, permet de commencer en cours de projet.',
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  startingPhaseOrder?: number;
}
