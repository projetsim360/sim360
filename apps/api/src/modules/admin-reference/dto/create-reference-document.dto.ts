import { IsString, IsNotEmpty, IsOptional, IsEnum, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenceDocumentCategory, PhaseType } from '@prisma/client';

export class CreateReferenceDocumentDto {
  @ApiProperty({ description: 'Titre du document de référence' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Catégorie du document',
    enum: ReferenceDocumentCategory,
  })
  @IsEnum(ReferenceDocumentCategory)
  category!: ReferenceDocumentCategory;

  @ApiPropertyOptional({ description: 'Phase PMI associée (null = toutes les phases)', enum: PhaseType })
  @IsEnum(PhaseType)
  @IsOptional()
  phase?: PhaseType;

  @ApiPropertyOptional({ description: 'Processus PMI (ex: "5.19")' })
  @IsString()
  @IsOptional()
  pmiProcess?: string;

  @ApiProperty({ description: 'Contenu Markdown du document' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ description: 'Terme PMI (obligatoire si category = GLOSSARY)' })
  @ValidateIf((o) => o.category === ReferenceDocumentCategory.GLOSSARY)
  @IsString()
  @IsNotEmpty({ message: 'Le terme est obligatoire pour les entrées de glossaire' })
  term?: string;

  @ApiPropertyOptional({ description: 'Exemple concret (obligatoire si category = GLOSSARY)' })
  @ValidateIf((o) => o.category === ReferenceDocumentCategory.GLOSSARY)
  @IsString()
  @IsNotEmpty({ message: 'L\'exemple est obligatoire pour les entrées de glossaire' })
  example?: string;
}
