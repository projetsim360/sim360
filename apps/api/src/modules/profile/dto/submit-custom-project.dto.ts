import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitCustomProjectDto {
  @ApiProperty({
    description: 'Nom du projet personnalisé',
    example: 'Migration cloud pour une PME',
  })
  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @ApiProperty({
    description: 'Description du projet',
    example: 'Migration de l\'infrastructure on-premise vers AWS pour une PME de 50 employés.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    description: 'Secteur d\'activité du projet',
    example: 'IT / Digital',
  })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiPropertyOptional({
    description: 'Contraintes spécifiques du projet',
    example: 'Budget limité à 100k, délai de 6 mois',
  })
  @IsString()
  @IsOptional()
  constraints?: string;

  @ApiPropertyOptional({
    description: 'Objectifs d\'apprentissage spécifiques',
    example: 'Maîtriser la gestion des risques et le suivi budgétaire',
  })
  @IsString()
  @IsOptional()
  learningObjectives?: string;
}
