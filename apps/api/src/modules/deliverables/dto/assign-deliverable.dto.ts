import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignDeliverableDto {
  @ApiProperty({
    description:
      "ID du membre d'equipe (expert IA) a qui assigner le livrable",
  })
  @IsString()
  teamMemberId!: string;

  @ApiPropertyOptional({
    description: "Instructions specifiques pour l'expert",
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
