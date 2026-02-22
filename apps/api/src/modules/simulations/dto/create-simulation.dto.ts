import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSimulationDto {
  @ApiProperty({ description: 'ID du scenario a instancier' })
  @IsString()
  scenarioId!: string;
}
