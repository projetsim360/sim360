import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from 'class-validator';

export const BULK_EMAIL_ACTION_MAX = 50;

export class BulkEmailActionDto {
  @ApiProperty({
    type: [String],
    description: `IDs des emails (min 1, max ${BULK_EMAIL_ACTION_MAX})`,
    example: ['cuid1', 'cuid2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(BULK_EMAIL_ACTION_MAX)
  @IsString({ each: true })
  emailIds!: string[];
}
