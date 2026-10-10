import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActionItemStatus } from '@prisma/client';

export class CreateActionItemDto {
  @ApiProperty({ example: 'Envoyer le budget révisé au comité' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @ApiPropertyOptional({ example: 'Sophie Martin' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  assignee?: string;

  @ApiPropertyOptional({ example: '2026-10-15' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ enum: ActionItemStatus })
  @IsOptional()
  @IsEnum(ActionItemStatus)
  status?: ActionItemStatus;

  @ApiPropertyOptional({ description: 'Meeting the action comes from' })
  @IsOptional()
  @IsString()
  meetingId?: string;
}
