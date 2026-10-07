import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectSectorDto {
  @ApiProperty({
    description: 'Secteur sélectionné par l\'apprenant (suggestion acceptée ou override)',
    example: 'IT / Digital',
  })
  @IsString()
  @IsNotEmpty()
  sector!: string;
}
