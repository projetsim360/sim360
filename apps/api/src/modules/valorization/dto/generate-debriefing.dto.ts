import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateDebriefingDto {
  @ApiPropertyOptional({ description: 'Force la régénération même si un debriefing existe déjà' })
  @IsOptional()
  @IsString()
  force?: string;
}
