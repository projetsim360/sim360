import { IsArray, IsNotEmpty, ValidateNested, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class SkillDto {
  @ApiProperty({ description: 'Nom de la compétence', example: 'Gestion des risques' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Niveau actuel de la compétence',
    example: 'basic',
    enum: ['none', 'basic', 'intermediate', 'advanced'],
  })
  @IsString()
  @IsNotEmpty()
  currentLevel!: string;

  @ApiProperty({
    description: 'Niveau cible de la compétence',
    example: 'intermediate',
    enum: ['none', 'basic', 'intermediate', 'advanced'],
  })
  @IsString()
  @IsNotEmpty()
  targetLevel!: string;

  @ApiPropertyOptional({ description: 'Écart calculé (0-100)', example: 50 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  gap?: number;
}

export class CustomizeSkillsDto {
  @ApiProperty({
    description: 'Liste des compétences personnalisées par l\'apprenant',
    type: [SkillDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills!: SkillDto[];
}
