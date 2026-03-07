import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliverableDto {
  @ApiPropertyOptional({
    description: 'ID du template de livrable (optionnel)',
  })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiProperty({
    description: 'Titre du livrable',
    example: 'Charte de projet',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Type du livrable',
    example: 'charter',
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description: 'Ordre de la phase associee',
    example: 1,
  })
  @IsInt()
  @Min(0)
  phaseOrder!: number;

  @ApiPropertyOptional({
    description: 'Date limite',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
