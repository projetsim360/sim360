import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    if (!dto.gdprConsent) {
      throw new BadRequestException('Vous devez accepter les conditions générales');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationExpiry = new Date(
      Date.now() + this.config.get<number>('auth.emailVerificationTokenExpiry', 86400000),
    );

    // Get or create default tenant
    let tenant = await this.prisma.tenant.findFirst({ where: { slug: 'sim360-dev' } });
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: { name: 'Sim360 Dev', slug: 'sim360-dev' },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        tenantId: tenant.id,
        emailVerificationToken,
        emailVerificationExpiry,
        gdprConsentAt: new Date(),
        gdprConsentIp: ip,
        gdprConsentUserAgent: userAgent,
      },
    });

    // Audit log for GDPR consent
    await this.prisma.auditLog.create({
      data: {
        action: 'GDPR_CONSENT',
        userId: user.id,
        ip,
        userAgent,
        metadata: { email: user.email, consentGiven: true },
      },
    });

    // Send verification email
    await this.mailService.sendVerificationEmail(user.email, user.firstName, emailVerificationToken);

    return { message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.' };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `ACCOUNT_LOCKED:Compte temporairement bloqué. Réessayez dans ${minutesLeft} minute(s).`,
      );
    }

    // Check email verified
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED:Veuillez vérifier votre email avant de vous connecter.');
    }

    // Check password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Veuillez vous connecter avec Google.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      const maxAttempts = this.config.get<number>('auth.maxFailedAttempts', 5);
      const newAttempts = user.failedLoginAttempts + 1;
      const lockoutData: { failedLoginAttempts: number; lockedUntil?: Date } = {
        failedLoginAttempts: newAttempts,
      };

      if (newAttempts >= maxAttempts) {
        lockoutData.lockedUntil = new Date(
          Date.now() + this.config.get<number>('auth.lockoutDurationMs', 900000),
        );
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: lockoutData,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on success
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      });
    }

    const rememberMe = dto.rememberMe ?? false;
    const tokens = await this.generateTokens(user.id, user.email, user.tenantId, user.role, rememberMe);

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        tenantId: user.tenantId,
        profileCompleted: user.profileCompleted,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const { user } = stored;
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.tenantId,
      user.role,
      stored.rememberMe,
    );

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        tenantId: user.tenantId,
        profileCompleted: user.profileCompleted,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de vérification invalide');
    }

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new BadRequestException('TOKEN_EXPIRED:Le lien de vérification a expiré. Demandez un nouveau lien.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.' };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success message to prevent email enumeration
    if (!user || user.emailVerifiedAt) {
      return { message: 'Si un compte existe avec cet email, un nouveau lien de vérification a été envoyé.' };
    }

    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationExpiry = new Date(
      Date.now() + this.config.get<number>('auth.emailVerificationTokenExpiry', 86400000),
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken, emailVerificationExpiry },
    });

    await this.mailService.sendVerificationEmail(user.email, user.firstName, emailVerificationToken);

    return { message: 'Si un compte existe avec cet email, un nouveau lien de vérification a été envoyé.' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (user && user.emailVerifiedAt) {
      const passwordResetToken = randomBytes(32).toString('hex');
      const passwordResetExpiry = new Date(
        Date.now() + this.config.get<number>('auth.passwordResetTokenExpiry', 3600000),
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken, passwordResetExpiry },
      });

      await this.mailService.sendPasswordResetEmail(user.email, user.firstName, passwordResetToken);
    }

    return { message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de réinitialisation invalide');
    }

    if (user.passwordResetExpiry && user.passwordResetExpiry < new Date()) {
      throw new BadRequestException('Le lien de réinitialisation a expiré. Demandez un nouveau lien.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    await this.mailService.sendPasswordResetConfirmation(user.email, user.firstName);

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async checkEmailAvailability(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return { available: !user };
  }

  async googleLogin(profile: { googleId: string; email: string; firstName: string; lastName: string; avatar?: string }) {
    // Find by googleId or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.googleId }, { email: profile.email }],
      },
    });

    if (user && !user.googleId) {
      // Link Google account to existing user
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: profile.googleId,
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          avatar: user.avatar ?? profile.avatar,
        },
      });
    } else if (!user) {
      // Get or create default tenant
      let tenant = await this.prisma.tenant.findFirst({ where: { slug: 'sim360-dev' } });
      if (!tenant) {
        tenant = await this.prisma.tenant.create({
          data: { name: 'Sim360 Dev', slug: 'sim360-dev' },
        });
      }

      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          googleId: profile.googleId,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar,
          tenantId: tenant.id,
          emailVerifiedAt: new Date(),
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email, user.tenantId, user.role, false);

    return { tokens, user };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    return { message: 'Déconnexion réussie' };
  }

  private async generateTokens(
    userId: string,
    email: string,
    tenantId: string,
    role: string,
    rememberMe: boolean,
  ) {
    const payload = { sub: userId, email, tenantId, role };

    const accessToken = this.jwtService.sign(payload);

    const refreshExpiresIn = rememberMe
      ? this.config.get<string>('auth.jwtRefreshRememberMeExpiresIn', '30d')
      : this.config.get<string>('auth.jwtRefreshExpiresIn', '7d');

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('auth.jwtRefreshSecret'),
      expiresIn: refreshExpiresIn,
    });

    // Calculate expiry from the string (e.g., '7d' or '30d')
    const daysMatch = refreshExpiresIn.match(/^(\d+)d$/);
    const refreshMs = daysMatch ? parseInt(daysMatch[1]) * 86400000 : 7 * 86400000;

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + refreshMs),
        rememberMe,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1h in seconds
    };
  }
}
