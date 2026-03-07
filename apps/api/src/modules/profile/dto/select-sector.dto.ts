import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectSectorDto {
  @ApiProperty({
    description: 'Secteur selectionne par l\'apprenant (suggestion acceptee ou override)',
    example: 'IT / Digital',
  })
  @IsString()
  @IsNotEmpty()
  sector!: string;
}
