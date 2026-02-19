import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
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
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
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
}
