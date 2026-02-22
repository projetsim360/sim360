import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DeliverableStatus } from '@prisma/client';

export class UpdateDeliverableDto {
  @ApiPropertyOptional({ description: 'Statut du livrable', enum: DeliverableStatus })
  @IsOptional()
  @IsEnum(DeliverableStatus)
  status?: DeliverableStatus;

  @ApiPropertyOptional({ description: 'Progression (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}
