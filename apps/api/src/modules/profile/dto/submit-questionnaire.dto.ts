import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitQuestionnaireDto {
  @ApiProperty({
    description: 'Objectif principal de l\'apprenant',
    example: 'Devenir chef de projet',
  })
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @ApiProperty({
    description: 'Domaine cible (secteur d\'activite vise)',
    example: 'IT / Digital',
  })
  @IsString()
  @IsNotEmpty()
  targetDomain!: string;

  @ApiProperty({
    description: 'Niveau d\'experience en gestion de projet',
    example: 'beginner',
    enum: ['none', 'beginner', 'intermediate', 'advanced'],
  })
  @IsString()
  @IsNotEmpty()
  experienceLevel!: string;

  @ApiProperty({
    description: 'Motivation principale',
    example: 'Reconversion professionnelle',
  })
  @IsString()
  @IsNotEmpty()
  mainMotivation!: string;

  @ApiPropertyOptional({
    description: 'Informations complementaires',
    example: 'Je suis actuellement developpeur et je souhaite evoluer vers le management de projet.',
  })
  @IsString()
  @IsOptional()
  additionalInfo?: string;
}
