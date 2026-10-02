// Explore Bharat Safar — Admin Moderation Service
// Reference: EBS-DOC-13-ADMIN Section 4 (Village Moderation), EBS-DOC-15-SOCIAL (Content Moderation)

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { prisma } from '@ebs/database';
import { logger } from '@ebs/logger';
import type { AdminModerationItem, AdminPaginatedResult } from '@ebs/types';
import { AdminModerationStatus, ModerationItemType } from '@ebs/types';
import type { AdminModerationActionDto } from '../dto/admin.dto';

@Injectable()
export class AdminModerationService {
  private readonly log = logger.child({ context: 'AdminModerationService' });

  /**
   * Retrieves a paginated list of all content moderation items (posts, stories, communities).
   * Per EBS-DOC-13-ADMIN: Moderators have access to Flagged Social Posts & Review Queue.
   */
  async getModerationQueue(
    page = 1,
    limit = 20,
    type?: ModerationItemType,
    status?: AdminModerationStatus,
  ): Promise<AdminPaginatedResult<AdminModerationItem>> {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where['type'] = type;
    if (status) where['status'] = status;

    const [rawItems, totalRecords] = await Promise.all([
      prisma.contentModerationQueue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contentModerationQueue.count({ where }),
    ]);

    const items: AdminModerationItem[] = rawItems.map(item => ({
      id: item.id,
      type: item.type as ModerationItemType,
      contentId: item.contentId,
      contentPreview: item.contentPreview ?? undefined,
      reportedBy: item.reportedByUserId ?? undefined,
      reportReason: item.reportReason ?? undefined,
      reportCount: item.reportCount,
      status: item.status as AdminModerationStatus,
      assignedModerator: item.assignedModeratorId ?? undefined,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Applies a moderation decision to a queued content item.
   * Valid actions: APPROVE, REJECT, REMOVE, WARN_USER, SUSPEND_USER, ESCALATE.
   */
  async applyModerationDecision(
    moderatorId: string,
    itemId: string,
    dto: AdminModerationActionDto,
  ): Promise<AdminModerationItem> {
    const item = await prisma.contentModerationQueue.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException({
        errorCode: 'EBS_ADMIN_MODERATION_ITEM_NOT_FOUND',
        message: `Moderation queue item ${itemId} was not found.`,
      });
    }

    const validActions = ['APPROVE', 'REJECT', 'REMOVE', 'WARN_USER', 'SUSPEND_USER', 'ESCALATE'];
    if (!validActions.includes(dto.action)) {
      throw new BadRequestException({
        errorCode: 'EBS_ADMIN_INVALID_MODERATION_ACTION',
        message: `Action '${dto.action}' is not a valid moderation decision.`,
      });
    }

    const newStatus = this.mapActionToStatus(dto.action);

    const updated = await prisma.contentModerationQueue.update({
      where: { id: itemId },
      data: {
        status: newStatus,
        assignedModeratorId: moderatorId,
        moderatorNotes: dto.notes,
        resolvedAt: ['APPROVE', 'REJECT', 'REMOVE', 'RESOLVED'].includes(newStatus)
          ? new Date()
          : undefined,
        updatedAt: new Date(),
      },
    });

    this.log.info('Moderation decision applied', { moderatorId, itemId, action: dto.action });

    return {
      id: updated.id,
      type: updated.type as ModerationItemType,
      contentId: updated.contentId,
      contentPreview: updated.contentPreview ?? undefined,
      reportedBy: updated.reportedByUserId ?? undefined,
      reportReason: updated.reportReason ?? undefined,
      reportCount: updated.reportCount,
      status: updated.status as AdminModerationStatus,
      assignedModerator: moderatorId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Creates a new moderation queue item when content is reported.
   */
  async reportContent(params: {
    type: ModerationItemType;
    contentId: string;
    contentPreview?: string;
    reportedByUserId?: string;
    reportReason?: string;
  }): Promise<AdminModerationItem> {
    const existing = await prisma.contentModerationQueue.findFirst({
      where: {
        contentId: params.contentId,
        type: params.type,
        status: { not: AdminModerationStatus.RESOLVED },
      },
    });

    if (existing) {
      // Increment report count if already in queue
      const updated = await prisma.contentModerationQueue.update({
        where: { id: existing.id },
        data: { reportCount: { increment: 1 }, updatedAt: new Date() },
      });

      return {
        id: updated.id,
        type: updated.type as ModerationItemType,
        contentId: updated.contentId,
        reportCount: updated.reportCount,
        status: updated.status as AdminModerationStatus,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    }

    const newItem = await prisma.contentModerationQueue.create({
      data: {
        type: params.type,
        contentId: params.contentId,
        contentPreview: params.contentPreview,
        reportedByUserId: params.reportedByUserId,
        reportReason: params.reportReason,
        reportCount: 1,
        status: AdminModerationStatus.PENDING,
      },
    });

    return {
      id: newItem.id,
      type: newItem.type as ModerationItemType,
      contentId: newItem.contentId,
      contentPreview: newItem.contentPreview ?? undefined,
      reportedBy: newItem.reportedByUserId ?? undefined,
      reportReason: newItem.reportReason ?? undefined,
      reportCount: newItem.reportCount,
      status: newItem.status as AdminModerationStatus,
      createdAt: newItem.createdAt.toISOString(),
      updatedAt: newItem.updatedAt.toISOString(),
    };
  }

  private mapActionToStatus(action: string): string {
    switch (action) {
      case 'APPROVE':
        return AdminModerationStatus.APPROVED;
      case 'REJECT':
      case 'REMOVE':
        return AdminModerationStatus.REJECTED;
      case 'ESCALATE':
        return AdminModerationStatus.ESCALATED;
      default:
        return AdminModerationStatus.UNDER_REVIEW;
    }
  }
}
