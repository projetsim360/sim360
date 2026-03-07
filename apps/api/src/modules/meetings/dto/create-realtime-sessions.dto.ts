import { IsOptional, IsArray, IsString } from 'class-validator';

export class CreateRealtimeSessionsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];
}
