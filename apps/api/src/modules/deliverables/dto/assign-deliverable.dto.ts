import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignDeliverableDto {
  @ApiProperty({
    description:
      "ID du membre d'équipe (expert IA) à qui assigner le livrable",
  })
  @IsString()
  teamMemberId!: string;

  @ApiPropertyOptional({
    description: "Instructions spécifiques pour l'expert",
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
