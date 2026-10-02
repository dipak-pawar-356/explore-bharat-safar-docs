// Explore Bharat Safar — User Notifications Controller
// Reference: EBS-DOC-19-NOTIF, EBS-DOC-09-API Section 5
// Endpoints for in-app notification center, read state, archive, preferences, and push registration
// Sprint 10: Enterprise Notification & Communication Platform

import {
  Controller,
  Get,
  Patch,
  Delete,
  Put,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationService } from './services/notification.service';
import { NotificationPreferenceService } from './services/notification-preference.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { PushSubscriptionDto } from './dto/push-subscription.dto';
import { INotification, INotificationPreferences } from '@ebs/types';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly preferenceService: NotificationPreferenceService,
  ) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: { id?: string; sub?: string },
    @Query() query: NotificationQueryDto,
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const userId = user.id || user.sub || '';
    return this.notificationService.getUserNotifications(userId, query);
  }

  @Get('unread-count')
  async getUnreadCount(
    @CurrentUser() user: { id?: string; sub?: string },
  ): Promise<{ unreadCount: number }> {
    const userId = user.id || user.sub || '';
    const unreadCount = await this.notificationService.getUnreadCount(userId);
    return { unreadCount };
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: { id?: string; sub?: string },
    @Param('id') id: string,
  ): Promise<INotification> {
    const userId = user.id || user.sub || '';
    return this.notificationService.markAsRead(userId, id);
  }

  @Patch('read-all')
  async markAllAsRead(
    @CurrentUser() user: { id?: string; sub?: string },
  ): Promise<{ count: number; success: boolean }> {
    const userId = user.id || user.sub || '';
    const result = await this.notificationService.markAllAsRead(userId);
    return { count: result.count, success: true };
  }

  @Patch(':id/archive')
  async archiveNotification(
    @CurrentUser() user: { id?: string; sub?: string },
    @Param('id') id: string,
  ): Promise<INotification> {
    const userId = user.id || user.sub || '';
    return this.notificationService.archiveNotification(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @CurrentUser() user: { id?: string; sub?: string },
    @Param('id') id: string,
  ): Promise<void> {
    const userId = user.id || user.sub || '';
    await this.notificationService.deleteNotification(userId, id);
  }

  @Get('preferences')
  async getPreferences(
    @CurrentUser() user: { id?: string; sub?: string },
  ): Promise<INotificationPreferences> {
    const userId = user.id || user.sub || '';
    return this.preferenceService.getPreferences(userId);
  }

  @Put('preferences')
  async updatePreferences(
    @CurrentUser() user: { id?: string; sub?: string },
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<INotificationPreferences> {
    const userId = user.id || user.sub || '';
    return this.preferenceService.updatePreferences(userId, dto);
  }

  @Post('push/subscribe')
  async registerPush(
    @CurrentUser() user: { id?: string; sub?: string },
    @Body() dto: PushSubscriptionDto,
  ): Promise<{ success: boolean }> {
    const userId = user.id || user.sub || '';
    return this.notificationService.registerPushSubscription(userId, dto, dto.userAgent);
  }
}
