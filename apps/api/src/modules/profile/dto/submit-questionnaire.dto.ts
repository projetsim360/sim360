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
    description: 'Domaine cible (secteur d\'activité visé)',
    example: 'IT / Digital',
  })
  @IsString()
  @IsNotEmpty()
  targetDomain!: string;

  @ApiProperty({
    description: 'Niveau d\'expérience en gestion de projet',
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
    description: 'Informations complémentaires',
    example: 'Je suis actuellement développeur et je souhaite évoluer vers le management de projet.',
  })
  @IsString()
  @IsOptional()
  additionalInfo?: string;
}
