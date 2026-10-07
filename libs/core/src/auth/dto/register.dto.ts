import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsBoolean, IsOptional, IsTimeZone } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'P@ssword1' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/, {
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
  })
  password!: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  gdprConsent!: boolean;

  @ApiPropertyOptional({ example: 'America/Toronto', description: 'IANA time zone detected by the browser' })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
