import { Job, Worker } from 'bullmq';
import { prisma } from '../config/db';
import { createRedisConnection } from '../config/redis';
import { notificationQueueName } from '../queues/notificationQueue';
import { alertDispatcher } from '../services/alertDispatcher';
import type { NotificationJobData } from '../types/notifications';

function parseNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

export class NotificationWorkerService {
  private worker: Worker<NotificationJobData> | null = null;
  private isRunning = false;

  async start(): Promise<void> {
    if (this.worker) {
      console.warn('[NotificationWorker] Worker already running');
      return;
    }

    const connection = createRedisConnection();
    connection.on('error', (error) => {
      console.error('[NotificationWorker] Redis connection error:', error);
    });

    this.worker = new Worker<NotificationJobData>(
      notificationQueueName,
      async (job) => {
        await this.process(job);
      },
      {
        connection,
        concurrency: parseNumberEnv('NOTIFICATION_WORKER_CONCURRENCY', 5),
      }
    );

    this.worker.on('completed', (job) => {
      console.log(
        `[NotificationWorker] Completed ${job.name} notification for will ${job.data.willId}`
      );
    });

    this.worker.on('failed', (job, error) => {
      console.error(
        `[NotificationWorker] Failed ${job?.name ?? 'unknown'} notification:`,
        error
      );

      if (job && this.isFinalAttempt(job)) {
        void this.releaseQueuedState(job.data);
      }
    });

    this.worker.on('error', (error) => {
      console.error('[NotificationWorker] Worker error:', error);
    });

    await this.worker.waitUntilReady();
    this.isRunning = true;
    console.log(
      `[NotificationWorker] Listening on queue "${notificationQueueName}"`
    );
  }

  async stop(): Promise<void> {
    if (!this.worker) {
      return;
    }

    await this.worker.close();
    this.worker = null;
    this.isRunning = false;
    console.log('[NotificationWorker] Worker stopped');
  }

  isHealthy(): boolean {
    return this.isRunning;
  }

  private async process(job: Job<NotificationJobData>): Promise<void> {
    const payload = alertDispatcher.buildEmailPayload(job.data);
    await alertDispatcher.sendAlertEmail(payload);
    await this.markAsSent(job.data);
  }

  private async markAsSent(job: NotificationJobData): Promise<void> {
    if (job.type === 'attestation-open') {
      await prisma.will.update({
        where: { id: job.willId },
        data: {
          attestationAlertEnqueuedAt: null,
          attestationAlertSentAt: new Date(),
        },
      });
      return;
    }

    if (job.type === 'manual-check-in-reminder') {
      return;
    }

    await prisma.will.update({
      where: { id: job.willId },
      data: {
        fundingRiskAlertEnqueuedAt: null,
        fundingRiskAlertSentAt: new Date(),
      },
    });
  }

  private async releaseQueuedState(job: NotificationJobData): Promise<void> {
    try {
      if (job.type === 'attestation-open') {
        await prisma.will.update({
          where: { id: job.willId },
          data: {
            attestationAlertEnqueuedAt: null,
          },
        });
        return;
      }

      if (job.type === 'manual-check-in-reminder') {
        return;
      }

      await prisma.will.update({
        where: { id: job.willId },
        data: {
          fundingRiskAlertEnqueuedAt: null,
        },
      });
    } catch (error) {
      console.error(
        `[NotificationWorker] Failed to release queue state for will ${job.willId}:`,
        error
      );
    }
  }

  private isFinalAttempt(job: Job<NotificationJobData>): boolean {
    const configuredAttempts =
      typeof job.opts.attempts === 'number' ? job.opts.attempts : 1;

    return job.attemptsMade >= configuredAttempts;
  }
}

export const notificationWorker = new NotificationWorkerService();
