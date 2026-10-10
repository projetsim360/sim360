import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { ActionItemStatus } from '@prisma/client';

export class UpdateActionItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(120)
  assignee?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2026-10-15' })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({ enum: ActionItemStatus })
  @IsOptional()
  @IsEnum(ActionItemStatus)
  status?: ActionItemStatus;
}
