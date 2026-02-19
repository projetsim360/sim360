import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  profileVisibility?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  simulationViewMode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showSimulationNames?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showLinkedReports?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailVisibility?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sidebarTransparent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifEmail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifBrowser?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notifDesktopLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notifEmailLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifAutoSubscribe?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  layoutPreference?: string;
}
