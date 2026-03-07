import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitCustomProjectDto {
  @ApiProperty({
    description: 'Nom du projet personnalise',
    example: 'Migration cloud pour une PME',
  })
  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @ApiProperty({
    description: 'Description du projet',
    example: 'Migration de l\'infrastructure on-premise vers AWS pour une PME de 50 employes.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    description: 'Secteur d\'activite du projet',
    example: 'IT / Digital',
  })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiPropertyOptional({
    description: 'Contraintes specifiques du projet',
    example: 'Budget limite a 100k, delai de 6 mois',
  })
  @IsString()
  @IsOptional()
  constraints?: string;

  @ApiPropertyOptional({
    description: 'Objectifs d\'apprentissage specifiques',
    example: 'Maitriser la gestion des risques et le suivi budgetaire',
  })
  @IsString()
  @IsOptional()
  learningObjectives?: string;
}
