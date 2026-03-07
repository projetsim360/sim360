import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

class AptitudeAnswerDto {
  @ApiProperty({ description: 'ID de la question' })
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @ApiProperty({ description: 'Reponse de l\'apprenant' })
  @IsString()
  @IsNotEmpty()
  answer!: string;
}

export class SubmitAptitudeTestDto {
  @ApiProperty({
    description: 'Tableau des reponses au test d\'aptitude',
    type: [AptitudeAnswerDto],
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AptitudeAnswerDto)
  answers!: AptitudeAnswerDto[];
}
