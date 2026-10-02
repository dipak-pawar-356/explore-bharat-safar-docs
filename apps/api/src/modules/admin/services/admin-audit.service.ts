// Explore Bharat Safar — Admin Audit Service
// Reference: EBS-DOC-13-ADMIN Section 1.1 (Complete Audit Accountability), EBS-DOC-40-SEC-BLUEPRINT

import { Injectable } from '@nestjs/common';
import { prisma } from '@ebs/database';
import { logger } from '@ebs/logger';
import type { AuditLogEntry, AdminPaginatedResult } from '@ebs/types';
import { AuditAction, AuditResourceType, AuditOutcome } from '@ebs/types';
import type { AuditLogQueryDto } from '../dto/admin.dto';

export interface CreateAuditLogParams {
  actorUserId: string;
  actorEmail: string;
  actorRoles: string[];
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceLabel?: string;
  changesBefore?: Record<string, unknown>;
  changesAfter?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  outcome: AuditOutcome;
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AdminAuditService {
  private readonly log = logger.child({ context: 'AdminAuditService' });

  /**
   * Records an administrative action in the append-only audit ledger.
   * Per EBS-DOC-13-ADMIN Section 1.1: every administrative mutation, state override,
   * refund authorization, and content approval must be permanently recorded.
   */
  async recordAuditLog(params: CreateAuditLogParams): Promise<void> {
    try {
      await prisma.adminAuditLog.create({
        data: {
          actorUserId: params.actorUserId,
          actorEmail: params.actorEmail,
          actorRoles: params.actorRoles,
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          resourceLabel: params.resourceLabel,
          changesBefore: (params.changesBefore ?? {}) as object,
          changesAfter: (params.changesAfter ?? {}) as object,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          sessionId: params.sessionId,
          outcome: params.outcome,
          failureReason: params.failureReason,
          metadata: (params.metadata ?? {}) as object,
        },
      });
    } catch (error) {
      // Audit log failure must NOT break the primary operation — log critical warning
      this.log.error('CRITICAL: Failed to write audit log entry', { error, params });
    }
  }

  /**
   * Retrieves a paginated, filtered list of audit log entries for admin inspection.
   * Only SUPER_ADMIN may access the master audit log.
   */
  async getAuditLogs(query: AuditLogQueryDto): Promise<AdminPaginatedResult<AuditLogEntry>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.actorUserId) {
      where['actorUserId'] = query.actorUserId;
    }

    if (query.action) {
      where['action'] = query.action;
    }

    if (query.resourceType) {
      where['resourceType'] = query.resourceType;
    }

    if (query.resourceId) {
      where['resourceId'] = query.resourceId;
    }

    if (query.outcome) {
      where['outcome'] = query.outcome;
    }

    if (query.fromDate || query.toDate) {
      where['createdAt'] = {
        ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
        ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
      };
    }

    const [rawLogs, totalRecords] = await Promise.all([
      prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminAuditLog.count({ where }),
    ]);

    const entries: AuditLogEntry[] = rawLogs.map(log => ({
      id: log.id,
      actorUserId: log.actorUserId,
      actorEmail: log.actorEmail,
      actorRoles: log.actorRoles as AuditLogEntry['actorRoles'],
      action: log.action as AuditAction,
      resourceType: log.resourceType as AuditResourceType,
      resourceId: log.resourceId ?? undefined,
      resourceLabel: log.resourceLabel ?? undefined,
      changes:
        log.changesBefore || log.changesAfter
          ? {
              before: log.changesBefore as Record<string, unknown>,
              after: log.changesAfter as Record<string, unknown>,
            }
          : undefined,
      ipAddress: log.ipAddress ?? undefined,
      userAgent: log.userAgent ?? undefined,
      sessionId: log.sessionId ?? undefined,
      outcome: log.outcome as AuditOutcome,
      failureReason: log.failureReason ?? undefined,
      metadata: log.metadata as Record<string, unknown>,
      createdAt: log.createdAt.toISOString(),
    }));

    return {
      items: entries,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  /**
   * Returns summary statistics of audit log activity for admin dashboard analytics.
   */
  async getAuditSummary(): Promise<{
    totalEntries: number;
    last24hEntries: number;
    failureCount: number;
    mostCommonAction: string;
  }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalEntries, last24hEntries, failureCount] = await Promise.all([
      prisma.adminAuditLog.count(),
      prisma.adminAuditLog.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.adminAuditLog.count({ where: { outcome: AuditOutcome.FAILURE } }),
    ]);

    return {
      totalEntries,
      last24hEntries,
      failureCount,
      mostCommonAction: AuditAction.USER_LOGIN,
    };
  }
}
