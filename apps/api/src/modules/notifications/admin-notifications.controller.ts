// Explore Bharat Safar — Admin Notification Operations Controller
// Reference: EBS-DOC-13-ADMIN Section 5.7, EBS-DOC-19-NOTIF
// Restricted to SYSTEM_ADMIN and SUPER_ADMIN roles via RBAC
// Sprint 10: Enterprise Notification & Communication Platform

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, INotificationAnalytics, IQueueMetrics, IDeadLetterJob } from '@ebs/types';
import { NotificationService } from './services/notification.service';
import { NotificationAnalyticsService } from './services/notification-analytics.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationDlqService } from './services/notification-dlq.service';
import {
  NotificationTemplateService,
  BuiltInTemplate,
} from './services/notification-template.service';
import { BroadcastNotificationDto } from './dto/broadcast-notification.dto';

@Controller('api/v1/admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN, UserRole.SUPER_ADMIN)
export class AdminNotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly analyticsService: NotificationAnalyticsService,
    private readonly queueService: NotificationQueueService,
    private readonly dlqService: NotificationDlqService,
    private readonly templateService: NotificationTemplateService,
  ) {}

  @Post('broadcast')
  @HttpCode(HttpStatus.ACCEPTED)
  async broadcast(
    @CurrentUser() user: { id?: string; sub?: string },
    @Body() dto: BroadcastNotificationDto,
  ): Promise<{ recipientCount: number; status: string }> {
    const userId = user.id || user.sub || 'admin';
    return this.notificationService.broadcastNotification(dto, userId);
  }

  @Get('analytics')
  async getAnalytics(@Query('timeframe') timeframe?: string): Promise<INotificationAnalytics> {
    return this.analyticsService.getAnalytics(timeframe);
  }

  @Get('queue-metrics')
  async getQueueMetrics(): Promise<IQueueMetrics> {
    return this.queueService.getQueueMetrics();
  }

  @Get('dlq')
  async listDlqJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ jobs: IDeadLetterJob[]; total: number }> {
    const p = page ? parseInt(page, 10) : 1;
    const l = limit ? parseInt(limit, 10) : 20;
    return this.dlqService.listDlqJobs(p, l);
  }

  @Post('dlq/:id/retry')
  async retryDlqJob(
    @CurrentUser() user: { id?: string; sub?: string },
    @Param('id') id: string,
  ): Promise<{ success: boolean; reDrivenJobId: string }> {
    const userId = user.id || user.sub || 'admin';
    return this.dlqService.retryJob(id, userId);
  }

  @Get('templates')
  async getTemplates(): Promise<{ templates: BuiltInTemplate[] }> {
    return { templates: this.templateService.getAllTemplates() };
  }
}
