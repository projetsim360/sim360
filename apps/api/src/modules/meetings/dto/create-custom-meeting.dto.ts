import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const CUSTOM_MEETING_PERSONALITIES = ['COOPERATIVE', 'NEUTRAL', 'RESISTANT', 'DIPLOMATIC', 'AGGRESSIVE'] as const;
export const CUSTOM_MEETING_SENIORITIES = ['EXECUTIVE', 'SENIOR', 'INTERMEDIATE', 'JUNIOR'] as const;

export class CustomMeetingParticipantDto {
  @ApiProperty({ example: 'Sophie Martin' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'Directrice financière', description: 'Rôle / fonction dans la réunion' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  role!: string;

  @ApiPropertyOptional({ enum: CUSTOM_MEETING_PERSONALITIES })
  @IsOptional()
  @IsIn(CUSTOM_MEETING_PERSONALITIES as unknown as string[])
  personality?: string;

  @ApiPropertyOptional({ enum: CUSTOM_MEETING_SENIORITIES })
  @IsOptional()
  @IsIn(CUSTOM_MEETING_SENIORITIES as unknown as string[])
  seniority?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, description: '1 = très réticent, 5 = très coopératif' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  cooperationLevel?: number;

  @ApiPropertyOptional({ example: 'Obtenir un budget révisé sous 5 %' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  objectives?: string;

  @ApiPropertyOptional({ example: 'Gel des embauches jusqu’en janvier' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  constraints?: string;

  @ApiPropertyOptional({ example: 'Direct et chiffré' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  communicationStyle?: string;
}

export class CreateCustomMeetingDto {
  @ApiProperty({ example: 'Arbitrage budgétaire du lot 2' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @ApiProperty({ type: [String], example: ['Valider le budget révisé', 'Décider du report du lot 3'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  objectives!: string[];

  @ApiProperty({ example: 30, minimum: 5, maximum: 120 })
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(120)
  durationMinutes!: number;

  @ApiPropertyOptional({ example: 'Construction', description: "Secteur d'activité (libellé libre)" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sector?: string;

  @ApiPropertyOptional({ description: 'Enjeux à traiter, contexte' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  stakes?: string;

  @ApiPropertyOptional({ enum: ['TEXT', 'AUDIO'] })
  @IsOptional()
  @IsIn(['TEXT', 'AUDIO'])
  mode?: 'TEXT' | 'AUDIO';

  @ApiProperty({ type: [CustomMeetingParticipantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => CustomMeetingParticipantDto)
  participants!: CustomMeetingParticipantDto[];
}
