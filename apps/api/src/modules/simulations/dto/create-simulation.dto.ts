import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSimulationDto {
  @ApiProperty({ description: 'ID du scénario à instancier' })
  @IsString()
  scenarioId!: string;

  @ApiPropertyOptional({
    description: 'Phase de départ (0 par défaut). Pour les scénarios Brownfield, permet de commencer en cours de projet.',
    minimum: 0,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(4)
  startingPhaseOrder?: number;
}
