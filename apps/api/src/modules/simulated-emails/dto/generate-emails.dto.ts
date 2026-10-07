import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateEmailsDto {
  @ApiPropertyOptional({
    description: 'Numéro de la phase pour laquelle générer les emails (défaut: phase courante)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  phaseOrder?: number;
}
