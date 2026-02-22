import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondEventDto {
  @ApiProperty({ description: 'Index de l\'option choisie (0-based)' })
  @IsInt()
  @Min(0)
  selectedOption!: number;
}
