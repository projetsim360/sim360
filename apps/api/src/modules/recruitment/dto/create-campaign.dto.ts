import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CultureType } from '@prisma/client';

export class RequiredSkillDto {
  @ApiProperty({ description: 'Nom de la competence' })
  @IsString()
  @IsNotEmpty()
  skill!: string;

  @ApiProperty({ description: 'Poids de la competence (1-10)', minimum: 1, maximum: 10 })
  @IsInt()
  @Min(1)
  @Max(10)
  weight!: number;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Titre de la campagne' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Intitule du poste' })
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ description: 'Description du poste' })
  @IsString()
  @IsNotEmpty()
  jobDescription!: string;

  @ApiProperty({ description: 'Competences requises avec ponderation', type: [RequiredSkillDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequiredSkillDto)
  requiredSkills!: RequiredSkillDto[];

  @ApiProperty({ description: 'Niveau d\'experience requis (junior, confirmed, senior)' })
  @IsString()
  @IsNotEmpty()
  experienceLevel!: string;

  @ApiProperty({ description: 'Types de projets pertinents', type: [String] })
  @IsArray()
  @IsString({ each: true })
  projectTypes!: string[];

  @ApiPropertyOptional({ description: 'Type de culture d\'entreprise', enum: CultureType })
  @IsOptional()
  @IsEnum(CultureType)
  culture?: CultureType;

  @ApiPropertyOptional({ description: 'Description de la culture d\'entreprise' })
  @IsOptional()
  @IsString()
  cultureDescription?: string;

  @ApiPropertyOptional({ description: 'Nombre maximum de candidats' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxCandidates?: number;
}
