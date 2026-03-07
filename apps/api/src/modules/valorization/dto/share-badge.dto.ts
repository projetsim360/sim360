import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ShareBadgeDto {
  @ApiPropertyOptional({ description: 'Rendre le badge public (true par defaut)' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
