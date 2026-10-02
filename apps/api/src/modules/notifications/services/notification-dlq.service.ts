// Explore Bharat Safar — Dead Letter Queue (DLQ) Management Service
// Reference: EBS-DOC-19-NOTIF Section 3, EBS-DOC-51-TECH Section 32
// Quarantines exhausted failures and provides SRE retry capabilities
// Sprint 10: Enterprise Notification & Communication Platform

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { prisma, type Prisma } from '@ebs/database';
import type { IDeadLetterJob } from '@ebs/types';
import { NotificationQueueService, type NotificationJobData } from './notification-queue.service';

@Injectable()
export class NotificationDlqService {
  private readonly logger = new Logger(NotificationDlqService.name);
  private readonly memoryDlq = new Map<string, IDeadLetterJob>();

  constructor(private readonly queueService: NotificationQueueService) {}

  async quarantineJob(params: {
    jobId: string;
    queueName: string;
    notificationId?: string;
    payload: Record<string, unknown>;
    failureReason: string;
    stackTrace?: string;
    retryCount?: number;
  }): Promise<IDeadLetterJob> {
    const id = `dlq-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const record: IDeadLetterJob = {
      id,
      jobId: params.jobId,
      queueName: params.queueName,
      notificationId: params.notificationId,
      payload: params.payload,
      failureReason: params.failureReason,
      stackTrace: params.stackTrace,
      retryCount: params.retryCount ?? 3,
      lastAttemptAt: new Date().toISOString(),
      resolvedAt: null,
      resolvedBy: null,
    };

    try {
      const dbEntry = await prisma.notificationDeadLetter.create({
        data: {
          jobId: params.jobId,
          queueName: params.queueName,
          notificationId: params.notificationId,
          payload: params.payload as Prisma.InputJsonValue,
          failureReason: params.failureReason,
          stackTrace: params.stackTrace,
          retryCount: params.retryCount ?? 3,
        },
      });
      record.id = dbEntry.id;
    } catch (err) {
      this.logger.warn(
        `Failed to persist DLQ record to database, saving in memory: ${String(err)}`,
      );
      this.memoryDlq.set(id, record);
    }

    this.logger.error(
      `[DLQ-QUARANTINED] Job #${params.jobId} routed to Dead Letter Queue. Reason: ${params.failureReason}`,
    );
    return record;
  }

  async listDlqJobs(page = 1, limit = 20): Promise<{ jobs: IDeadLetterJob[]; total: number }> {
    try {
      const [records, total] = await Promise.all([
        prisma.notificationDeadLetter.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notificationDeadLetter.count(),
      ]);

      const jobs: IDeadLetterJob[] = records.map(r => ({
        id: r.id,
        jobId: r.jobId,
        queueName: r.queueName,
        notificationId: r.notificationId ?? undefined,
        payload: r.payload as Record<string, unknown>,
        failureReason: r.failureReason,
        stackTrace: r.stackTrace ?? undefined,
        retryCount: r.retryCount,
        lastAttemptAt: r.lastAttemptAt.toISOString(),
        resolvedAt: r.resolvedAt?.toISOString() ?? null,
        resolvedBy: r.resolvedBy ?? null,
      }));

      return { jobs, total };
    } catch {
      // In-memory fallback
      const all = Array.from(this.memoryDlq.values());
      const offset = (page - 1) * limit;
      return {
        jobs: all.slice(offset, offset + limit),
        total: all.length,
      };
    }
  }

  async retryJob(
    deadLetterId: string,
    resolvedBy = 'ADMIN',
  ): Promise<{ success: boolean; reDrivenJobId: string }> {
    let job: IDeadLetterJob | undefined;

    try {
      const dbEntry = await prisma.notificationDeadLetter.findUnique({
        where: { id: deadLetterId },
      });
      if (dbEntry) {
        job = {
          id: dbEntry.id,
          jobId: dbEntry.jobId,
          queueName: dbEntry.queueName,
          notificationId: dbEntry.notificationId ?? undefined,
          payload: dbEntry.payload as Record<string, unknown>,
          failureReason: dbEntry.failureReason,
          retryCount: dbEntry.retryCount,
          lastAttemptAt: dbEntry.lastAttemptAt.toISOString(),
        };

        await prisma.notificationDeadLetter.update({
          where: { id: deadLetterId },
          data: {
            resolvedAt: new Date(),
            resolvedBy,
          },
        });
      }
    } catch {
      job = this.memoryDlq.get(deadLetterId);
    }

    if (!job) {
      throw new NotFoundException(`Dead Letter job with ID ${deadLetterId} not found.`);
    }

    // Re-enqueue payload to the active queue
    const result = await this.queueService.enqueueNotification(
      job.payload as unknown as NotificationJobData,
    );
    this.logger.log(
      `[DLQ-RETRY] Dead letter job ${deadLetterId} re-driven as job #${result.jobId}`,
    );

    return {
      success: true,
      reDrivenJobId: result.jobId,
    };
  }
}
