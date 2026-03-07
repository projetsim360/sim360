import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhaseType, DeliverableTemplateDifficulty } from '@prisma/client';

export class CreateDeliverableTemplateDto {
  @ApiProperty({ description: 'Titre du template de livrable' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Type de livrable (charter, wbs, risk-register, schedule, etc.)' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Phase PMI associee', enum: PhaseType })
  @IsEnum(PhaseType)
  phase!: PhaseType;

  @ApiPropertyOptional({ description: 'Description du template' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Contenu Markdown du template' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ description: 'Criteres d\'evaluation structures (JSON)' })
  @IsObject()
  evaluationCriteria!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Processus PMI (ex: "4.1")' })
  @IsString()
  @IsOptional()
  pmiProcess?: string;

  @ApiPropertyOptional({
    description: 'Niveau de difficulte',
    enum: DeliverableTemplateDifficulty,
    default: DeliverableTemplateDifficulty.STANDARD,
  })
  @IsEnum(DeliverableTemplateDifficulty)
  @IsOptional()
  difficulty?: DeliverableTemplateDifficulty;

  @ApiPropertyOptional({ description: 'Exemple de livrable de reference (Markdown). Visible uniquement par les admins.' })
  @IsString()
  @IsOptional()
  referenceExample?: string;
}
