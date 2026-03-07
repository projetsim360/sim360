import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitDeliverableDto {
  @ApiPropertyOptional({
    description: 'Commentaire optionnel lors de la soumission',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
