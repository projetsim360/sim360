import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsEnum, ValidateNested, Min, Max, MinLength, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CultureType } from '@prisma/client';

export class RequiredSkillDto {
  @ApiProperty({ description: 'Nom de la compétence' })
  @IsString()
  @IsNotEmpty()
  skill!: string;

  @ApiProperty({ description: 'Poids de la compétence (1-10)', minimum: 1, maximum: 10 })
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

  @ApiProperty({ description: 'Intitulé du poste' })
  @IsString()
  @IsNotEmpty()
  jobTitle!: string;

  @ApiProperty({ description: 'Description du poste (min 10 caractères)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'La description doit faire au moins 10 caractères' })
  jobDescription!: string;

  @ApiProperty({ description: 'Compétences requises avec pondération (min 1)', type: [RequiredSkillDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Ajoutez au moins une compétence' })
  @ValidateNested({ each: true })
  @Type(() => RequiredSkillDto)
  requiredSkills!: RequiredSkillDto[];

  @ApiProperty({ description: 'Niveau d\'expérience requis (junior, confirmed, senior)' })
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
