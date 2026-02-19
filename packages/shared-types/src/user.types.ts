import type { UserRole } from './auth.types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  profileCompleted: boolean;
  language?: string;
  experienceLevel?: string;
  bio?: string;
  phone?: string;
  jobTitle?: string;
  emailVerifiedAt?: string;
  profileVisibility: boolean;
  timezone?: string;
  dateFormat?: string;
  simulationViewMode?: string;
  showSimulationNames: boolean;
  showLinkedReports: boolean;
  emailVisibility: boolean;
  sidebarTransparent: boolean;
  notifEmail: boolean;
  notifBrowser: boolean;
  notifDesktopLevel?: string;
  notifEmailLevel?: string;
  notifAutoSubscribe: boolean;
  layoutPreference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  jobTitle?: string;
  language?: string;
  experienceLevel?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSettingsDto {
  profileVisibility?: boolean;
  timezone?: string;
  dateFormat?: string;
  simulationViewMode?: string;
  showSimulationNames?: boolean;
  showLinkedReports?: boolean;
  emailVisibility?: boolean;
  sidebarTransparent?: boolean;
  notifEmail?: boolean;
  notifBrowser?: boolean;
  notifDesktopLevel?: string;
  notifEmailLevel?: string;
  notifAutoSubscribe?: boolean;
  layoutPreference?: string;
}

export interface CompleteProfileWizardDto {
  language: string;
  experienceLevel: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  jobTitle?: string;
}
