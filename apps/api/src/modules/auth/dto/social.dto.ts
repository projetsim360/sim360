import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnlinkGoogleDto {
  @ApiProperty({ description: 'Current password to confirm unlinking' })
  @IsString()
  @MinLength(1)
  password!: string;
}
