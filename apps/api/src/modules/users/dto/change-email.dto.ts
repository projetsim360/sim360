import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email invalide' })
  newEmail!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}
