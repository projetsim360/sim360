import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export class BulkEmailActionDto {
  @ApiProperty({
    type: [String],
    description: "IDs des emails (min 1, max 50)",
    example: ['cuid1', 'cuid2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  emailIds!: string[];
}
