import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteProfileWizardDto } from './dto/complete-profile-wizard.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import * as bcrypt from 'bcryptjs';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatar: true,
  role: true,
  isActive: true,
  profileCompleted: true,
  language: true,
  experienceLevel: true,
  bio: true,
  phone: true,
  jobTitle: true,
  emailVerifiedAt: true,
  profileVisibility: true,
  timezone: true,
  dateFormat: true,
  simulationViewMode: true,
  showSimulationNames: true,
  showLinkedReports: true,
  emailVisibility: true,
  sidebarTransparent: true,
  notifEmail: true,
  notifBrowser: true,
  notifDesktopLevel: true,
  notifEmailLevel: true,
  notifAutoSubscribe: true,
  layoutPreference: true,
  twoFactorEnabled: true,
  googleId: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private mailService: MailService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, tenantId: string, data: { firstName?: string; lastName?: string; avatar?: string }) {
    await this.findOne(id, tenantId);

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getFullProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ...USER_SELECT, tenantId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: USER_SELECT,
    });
  }

  async completeProfileWizard(userId: string, dto: CompleteProfileWizardDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        profileCompleted: true,
      },
      select: USER_SELECT,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('Impossible de changer le mot de passe pour ce compte');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Mot de passe actuel incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all existing refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Mot de passe modifié avec succès' };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const avatarUrl = await this.storageService.uploadToLocal(file, userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: USER_SELECT,
    });
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: USER_SELECT,
    });
  }

  async deleteAvatar(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.avatar) {
      await this.storageService.deleteLocalFile(user.avatar);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: USER_SELECT,
    });
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // For OAuth-only accounts (no password), allow deletion without password check
    if (user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new BadRequestException('Mot de passe incorrect');
      }
    }

    // Delete avatar file if exists
    if (user.avatar) {
      await this.storageService.deleteLocalFile(user.avatar);
    }

    // Cascade delete handles refresh tokens, etc.
    await this.prisma.user.delete({ where: { id: userId } });

    return { message: 'Compte supprimé avec succès' };
  }

  async requestEmailChange(userId: string, newEmail: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('Impossible de changer l\'email pour ce compte');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }

    // Check if email is already taken
    const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Generate a verification token
    const token = this.jwtService.sign(
      { userId, newEmail, type: 'email_change' },
      { secret: this.config.get<string>('auth.jwtSecret')!, expiresIn: '1h' },
    );

    await this.mailService.sendEmailChangeVerification(newEmail, user.firstName, token);

    return { message: 'Un email de vérification a été envoyé à la nouvelle adresse' };
  }

}
