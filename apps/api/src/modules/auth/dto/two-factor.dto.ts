import { IsString, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateTwoFactorDto {
  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  password!: string;
}

export class EnableTwoFactorDto {
  @ApiProperty({ description: 'TOTP 6-digit code from authenticator app', example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}

export class DisableTwoFactorDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  password!: string;

  @ApiProperty({ description: 'TOTP 6-digit code', example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}

export class VerifyTwoFactorLoginDto {
  @ApiProperty({ description: 'Temporary token received after login' })
  @IsString()
  tempToken!: string;

  @ApiPropertyOptional({ description: 'TOTP 6-digit code', example: '123456' })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code?: string;

  @ApiPropertyOptional({ description: 'Backup code (format: xxxx-xxxx)' })
  @IsOptional()
  @IsString()
  backupCode?: string;
}

export class RegenerateBackupCodesDto {
  @ApiProperty({ description: 'Current password' })
  @IsString()
  password!: string;

  @ApiProperty({ description: 'TOTP 6-digit code', example: '123456' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}
