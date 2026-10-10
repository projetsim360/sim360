import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ShareBadgeDto {
  @ApiPropertyOptional({ description: 'Rendre le badge public (true par défaut)' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
