import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestRevisionDelegatedDto {
  @ApiProperty({
    description: 'Feedback du chef de projet pour la revision',
  })
  @IsString()
  feedback!: string;
}
