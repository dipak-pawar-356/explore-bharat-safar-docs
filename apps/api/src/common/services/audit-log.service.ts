import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@ebs/database';
import { StructuredLogger } from '@ebs/logger';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  module?: string;
  entityName?: string;
  entityId?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new StructuredLogger('AuditLogService');

  async log(params: CreateAuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId || undefined,
          action: params.action,
          module: params.module || 'AUTH',
          entityName: params.entityName || 'User',
          entityId: params.entityId || params.userId || 'system',
          oldValues: (params.oldValues ?? undefined) as Prisma.InputJsonValue | undefined,
          newValues: (params.newValues ?? undefined) as Prisma.InputJsonValue | undefined,
          ipAddress: params.ipAddress || 'unknown',
          userAgent: params.userAgent || 'unknown',
        },
      });

      this.logger.info('audit.event_recorded', {
        action: params.action,
        userId: params.userId,
        module: params.module || 'AUTH',
      });
    } catch (err) {
      // Non-blocking error handling to ensure main request is not aborted
      this.logger.error('audit.log_persistence_failed', {
        error: err instanceof Error ? err.message : String(err),
        action: params.action,
        userId: params.userId,
      });
    }
  }
}
