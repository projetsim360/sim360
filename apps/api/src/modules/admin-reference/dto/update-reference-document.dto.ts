import { IsString, IsNotEmpty, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenceDocumentCategory, PhaseType } from '@prisma/client';

export class UpdateReferenceDocumentDto {
  @ApiPropertyOptional({ description: 'Titre du document de reference' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Categorie du document',
    enum: ReferenceDocumentCategory,
  })
  @IsEnum(ReferenceDocumentCategory)
  @IsOptional()
  category?: ReferenceDocumentCategory;

  @ApiPropertyOptional({ description: 'Phase PMI associee', enum: PhaseType })
  @IsEnum(PhaseType)
  @IsOptional()
  phase?: PhaseType;

  @ApiPropertyOptional({ description: 'Processus PMI (ex: "5.19")' })
  @IsString()
  @IsOptional()
  pmiProcess?: string;

  @ApiPropertyOptional({ description: 'Contenu Markdown du document' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Terme PMI (obligatoire si category = GLOSSARY)' })
  @ValidateIf((o) => o.category === ReferenceDocumentCategory.GLOSSARY)
  @IsString()
  @IsNotEmpty({ message: 'Le terme est obligatoire pour les entrees de glossaire' })
  @IsOptional()
  term?: string;

  @ApiPropertyOptional({ description: 'Exemple concret (obligatoire si category = GLOSSARY)' })
  @ValidateIf((o) => o.category === ReferenceDocumentCategory.GLOSSARY)
  @IsString()
  @IsNotEmpty({ message: 'L\'exemple est obligatoire pour les entrees de glossaire' })
  @IsOptional()
  example?: string;
}
