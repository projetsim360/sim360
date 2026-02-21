import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public, Auditable } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import {
  GenerateTwoFactorDto,
  EnableTwoFactorDto,
  DisableTwoFactorDto,
  VerifyTwoFactorLoginDto,
  RegenerateBackupCodesDto,
} from './dto/two-factor.dto';
import { UnlinkGoogleDto } from './dto/social.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @Auditable('auth.register', 'Auth')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(
      dto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('login')
  @Public()
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Auditable('auth.login', 'Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: { refreshToken: string }) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('verify-email')
  @Public()
  @Auditable('auth.verify-email', 'Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @Public()
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @Public()
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Public()
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @Auditable('auth.reset-password', 'Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('check-email')
  @Public()
  @ApiOperation({ summary: 'Check if email is available' })
  async checkEmail(@Query('email') email: string) {
    return this.authService.checkEmailAvailability(email);
  }

  @Get('confirm-email-change')
  @Public()
  @ApiOperation({ summary: 'Confirm email change via token' })
  async confirmEmailChange(@Query('token') token: string) {
    return this.authService.confirmEmailChange(token);
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user as any);
    const frontendUrl = this.config.get<string>('auth.frontendUrl', 'http://localhost:5173');

    if (result.requires2FA) {
      const url = `${frontendUrl}/auth/google-callback?requires2FA=true&tempToken=${result.tempToken}`;
      res.redirect(url);
    } else {
      const url = `${frontendUrl}/auth/google-callback?accessToken=${result.tokens!.accessToken}&refreshToken=${result.tokens!.refreshToken}`;
      res.redirect(url);
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Auditable('auth.logout', 'Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body() dto: { refreshToken?: string },
  ) {
    return this.authService.logout(userId, dto.refreshToken);
  }

  // ─── Social Account Management ───────────────────────────

  @Post('social/unlink-google')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Auditable('auth.unlink-google', 'Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlink Google account' })
  async unlinkGoogle(
    @CurrentUser('id') userId: string,
    @Body() dto: UnlinkGoogleDto,
  ) {
    return this.authService.unlinkGoogle(userId, dto.password);
  }

  // ─── Two-Factor Authentication ───────────────────────────

  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  async generateTwoFactor(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateTwoFactorDto,
  ) {
    return this.authService.generateTwoFactorSecret(userId, dto.password);
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Auditable('auth.enable-2fa', 'Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA after verifying code' })
  async enableTwoFactor(
    @CurrentUser('id') userId: string,
    @Body() dto: EnableTwoFactorDto,
  ) {
    return this.authService.enableTwoFactor(userId, dto.code);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Auditable('auth.disable-2fa', 'Auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  async disableTwoFactor(
    @CurrentUser('id') userId: string,
    @Body() dto: DisableTwoFactorDto,
  ) {
    return this.authService.disableTwoFactor(userId, dto.password, dto.code);
  }

  @Post('2fa/verify')
  @Public()
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA code during login' })
  async verifyTwoFactorLogin(@Body() dto: VerifyTwoFactorLoginDto) {
    return this.authService.verifyTwoFactorLogin(dto.tempToken, dto.code, dto.backupCode);
  }

  @Post('2fa/backup-codes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate backup codes' })
  async regenerateBackupCodes(
    @CurrentUser('id') userId: string,
    @Body() dto: RegenerateBackupCodesDto,
  ) {
    return this.authService.regenerateBackupCodes(userId, dto.password, dto.code);
  }
}
