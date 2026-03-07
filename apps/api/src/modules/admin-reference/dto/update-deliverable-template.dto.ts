import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PhaseType, DeliverableTemplateDifficulty } from '@prisma/client';

export class UpdateDeliverableTemplateDto {
  @ApiPropertyOptional({ description: 'Titre du template de livrable' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Type de livrable' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Phase PMI associee', enum: PhaseType })
  @IsEnum(PhaseType)
  @IsOptional()
  phase?: PhaseType;

  @ApiPropertyOptional({ description: 'Description du template' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Contenu Markdown du template' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Criteres d\'evaluation structures (JSON)' })
  @IsObject()
  @IsOptional()
  evaluationCriteria?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Processus PMI (ex: "4.1")' })
  @IsString()
  @IsOptional()
  pmiProcess?: string;

  @ApiPropertyOptional({ description: 'Niveau de difficulte', enum: DeliverableTemplateDifficulty })
  @IsEnum(DeliverableTemplateDifficulty)
  @IsOptional()
  difficulty?: DeliverableTemplateDifficulty;

  @ApiPropertyOptional({ description: 'Exemple de livrable de reference (Markdown). Visible uniquement par les admins.' })
  @IsString()
  @IsOptional()
  referenceExample?: string;
}
