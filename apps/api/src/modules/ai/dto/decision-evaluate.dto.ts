import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DecisionEvaluateDto {
  @ApiProperty()
  @IsString()
  simulationId!: string;

  @ApiProperty()
  @IsString()
  decisionId!: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  selectedOption!: number;
}
