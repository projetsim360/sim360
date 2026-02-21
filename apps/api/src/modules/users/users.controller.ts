import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CurrentUser, CurrentTenant, Roles, Auditable } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteProfileWizardDto } from './dto/complete-profile-wizard.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users in tenant' })
  findAll(@CurrentTenant() tenantId: string) {
    return this.usersService.findAll(tenantId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user full profile' })
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getFullProfile(userId);
  }

  @Patch('me/profile')
  @Auditable('user.update-profile', 'User')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/complete-wizard')
  @ApiOperation({ summary: 'Complete profile wizard' })
  completeWizard(@CurrentUser('id') userId: string, @Body() dto: CompleteProfileWizardDto) {
    return this.usersService.completeProfileWizard(userId, dto);
  }

  @Patch('me/settings')
  @ApiOperation({ summary: 'Update current user settings' })
  updateSettings(@CurrentUser('id') userId: string, @Body() dto: UpdateSettingsDto) {
    return this.usersService.updateSettings(userId, dto);
  }

  @Post('me/change-password')
  @Auditable('user.change-password', 'User')
  @ApiOperation({ summary: 'Change password' })
  changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto);
  }

  @Post('me/avatar')
  @Auditable('user.upload-avatar', 'User')
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(userId, file);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Delete avatar' })
  deleteAvatar(@CurrentUser('id') userId: string) {
    return this.usersService.deleteAvatar(userId);
  }

  @Delete('me')
  @Auditable('user.delete-account', 'User')
  @ApiOperation({ summary: 'Delete account' })
  deleteAccount(@CurrentUser('id') userId: string, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(userId, dto.password || '');
  }

  @Post('me/change-email')
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @Auditable('user.change-email', 'User')
  @ApiOperation({ summary: 'Request email change' })
  changeEmail(@CurrentUser('id') userId: string, @Body() dto: ChangeEmailDto) {
    return this.usersService.requestEmailChange(userId, dto.newEmail, dto.password);
  }

  @Get(':id')
  @Roles(UserRole.MANAGER)
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.usersService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
    @Body() dto: { firstName?: string; lastName?: string; avatar?: string },
  ) {
    return this.usersService.update(id, tenantId, dto);
  }
}
