import { IsString, IsArray, IsOptional, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ChatMessage {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content!: string;
}

export class MeetingRespondDto {
  @ApiProperty()
  @IsString()
  simulationId!: string;

  @ApiProperty()
  @IsString()
  participantName!: string;

  @ApiProperty()
  @IsString()
  userMessage!: string;

  @ApiProperty({ type: [ChatMessage], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessage)
  history?: ChatMessage[];
}
