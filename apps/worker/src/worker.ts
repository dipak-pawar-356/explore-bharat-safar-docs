import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '@ebs/logger';
import { WorkerQueues } from './queues/queue.constants';
import { workerConfig } from './config/worker.config';
import { processCertificateJob } from './processors/certificate.processor';
import { processStoryArchival } from './processors/story-archival.processor';
import { processNotificationJob } from './processors/notification.processor';

const redisConnection = new Redis({
  host: workerConfig.redis.host,
  port: workerConfig.redis.port,
  password: workerConfig.redis.password,
  maxRetriesPerRequest: null,
});

logger.info('Starting Explore Bharat Safar Background Workers...');

// 1. Certificate Worker
const certificateWorker = new Worker(
  WorkerQueues.CERTIFICATES,
  async job => {
    logger.info(`Processing certificate generation job #${job.id}`, { jobId: job.id });
    return processCertificateJob(job.data);
  },
  { connection: redisConnection, concurrency: workerConfig.concurrency.certificates },
);

certificateWorker.on('completed', job => {
  logger.info(`Certificate job #${job.id} completed successfully`, { jobId: job.id });
});

certificateWorker.on('failed', (job, err) => {
  logger.error(`Certificate job #${job?.id} failed`, { jobId: job?.id, error: err.message });
});

// 2. Notification Dispatch Worker (Sprint 10)
const notificationWorker = new Worker(
  WorkerQueues.NOTIFICATIONS,
  async job => {
    logger.info(`Processing notification dispatch job #${job.id}`, { jobId: job.id });
    return processNotificationJob(job);
  },
  { connection: redisConnection, concurrency: workerConfig.concurrency.notifications },
);

notificationWorker.on('completed', job => {
  logger.info(`Notification job #${job.id} dispatched successfully`, { jobId: job.id });
});

notificationWorker.on('failed', (job, err) => {
  logger.error(`Notification job #${job?.id} failed dispatch`, {
    jobId: job?.id,
    error: err.message,
  });
});

// 3. Story Cleanup Cron Loop (Runs every 60s)
setInterval(async () => {
  try {
    await processStoryArchival();
  } catch (err) {
    logger.error('Story archival error', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}, 60 * 1000);

logger.info('BullMQ Worker cluster is active and listening for background tasks.');
