import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateEmailsDto {
  @ApiPropertyOptional({
    description: 'Numero de la phase pour laquelle generer les emails (defaut: phase courante)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  phaseOrder?: number;
}
