import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondEmailDto {
  @ApiProperty({
    description: 'Réponse de l\'apprenant à l\'email simulé',
    example: 'Bonjour, merci pour votre message. Je prends note de vos remarques et je reviendrai vers vous avec un plan d\'action.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  response!: string;
}
