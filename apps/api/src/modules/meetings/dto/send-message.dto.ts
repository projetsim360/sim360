import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  content!: string;

  @ApiProperty({ description: 'Target participant ID', required: false })
  @IsOptional()
  @IsString()
  participantId?: string;
}
