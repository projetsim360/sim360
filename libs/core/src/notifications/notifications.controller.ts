import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser, CurrentTenant } from '../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListNotificationsDto } from './dto/list-notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications (paginated)' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
    @Query() query: ListNotificationsDto,
  ) {
    return this.notificationsService.findAll(userId, tenantId, query);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  getUnreadCount(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificationsService.getUnreadCount(userId, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single notification' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.findOne(id, userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificationsService.markAllAsRead(userId, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a notification' })
  archive(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationsService.archive(id, userId);
  }

  @Post('bulk-archive')
  @ApiOperation({ summary: 'Archive multiple notifications' })
  bulkArchive(
    @Body() body: { ids: string[] },
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.bulkArchive(body.ids, userId);
  }
}
