import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Sector, ScenarioType } from '@prisma/client';

export class GenerateScenarioDto {
  @ApiPropertyOptional({ description: 'Nom du projet custom' })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiPropertyOptional({ description: 'Description du projet' })
  @IsOptional()
  @IsString()
  projectDescription?: string;

  @ApiPropertyOptional({ description: 'Contraintes du projet' })
  @IsOptional()
  @IsString()
  constraints?: string;

  @ApiPropertyOptional({ description: "Objectifs d'apprentissage" })
  @IsOptional()
  @IsString()
  learningObjectives?: string;

  @ApiPropertyOptional({ enum: Sector })
  @IsOptional()
  @IsEnum(Sector)
  sector?: Sector;

  @ApiPropertyOptional({ enum: Difficulty })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiPropertyOptional({ enum: ScenarioType })
  @IsOptional()
  @IsEnum(ScenarioType)
  scenarioType?: ScenarioType;

  @ApiPropertyOptional({
    description:
      'Utiliser le profil utilisateur pour calibrer le scenario',
  })
  @IsOptional()
  @IsBoolean()
  useProfile?: boolean;
}
