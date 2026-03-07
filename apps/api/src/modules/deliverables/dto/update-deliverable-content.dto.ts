import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeliverableContentDto {
  @ApiProperty({
    description: 'Contenu markdown du livrable',
    example: '# Charte de projet\n\n## Contexte\n...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100000)
  content!: string;
}
