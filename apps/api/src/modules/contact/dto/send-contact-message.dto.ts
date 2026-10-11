import { IsEmail, IsIn, IsInt, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class SendContactMessageDto {
  @IsString()
  @Length(2, 120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @IsEmail()
  @MaxLength(254)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email!: string;

  @IsString()
  @Length(10, 4000)
  message!: string;

  @IsOptional()
  @IsIn(['fr', 'en'])
  locale?: 'fr' | 'en';

  /** Public page the form lives on, for context in the notification. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  page?: string;

  /** Honeypot field, hidden from humans. Must stay empty. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  /** Time between form display and submit, in ms. */
  @IsOptional()
  @IsInt()
  @Min(0)
  elapsedMs?: number;
}
