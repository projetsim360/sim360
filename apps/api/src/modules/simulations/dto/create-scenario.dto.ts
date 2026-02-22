import { IsString, IsOptional, IsEnum, IsInt, IsObject, IsArray, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Sector } from '@prisma/client';

export class CreateScenarioPhaseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE'] })
  @IsString()
  type!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  durationDays!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  completionCriteria?: Record<string, unknown>;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  meetingTemplates?: Record<string, unknown>[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  decisionTemplates?: Record<string, unknown>[];

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  randomEventTemplates?: Record<string, unknown>[];
}

export class CreateScenarioDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiProperty({ enum: Sector })
  @IsEnum(Sector)
  sector!: Sector;

  @ApiProperty({ enum: Difficulty })
  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDurationHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  competencies?: string[];

  @ApiProperty()
  @IsObject()
  projectTemplate!: Record<string, unknown>;

  @ApiProperty()
  @IsObject()
  initialKpis!: Record<string, number>;

  @ApiProperty({ type: [CreateScenarioPhaseDto] })
  @IsArray()
  phases!: CreateScenarioPhaseDto[];
}
