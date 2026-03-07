import { IsArray, ArrayMinSize, ArrayMaxSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompareCandidatesDto {
  @ApiProperty({ description: 'IDs des deux candidats a comparer', type: [String] })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  candidateIds!: string[];
}
