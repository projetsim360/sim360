import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateDebriefingDto {
  @ApiPropertyOptional({ description: 'Force la regeneration meme si un debriefing existe deja' })
  @IsOptional()
  @IsString()
  force?: string;
}
