import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis';
import type { NotificationJobData } from '../types/notifications';

function parseNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

export const notificationQueueName =
  process.env.NOTIFICATION_QUEUE_NAME || 'chainwill-notifications';

const notificationQueueConnection = createRedisConnection();

notificationQueueConnection.on('error', (error) => {
  console.error('[NotificationQueue] Redis connection error:', error);
});

function getNotificationJobId(job: NotificationJobData): string {
  return `${job.type}:${job.willId}`;
}

export class NotificationQueueService {
  private readonly queue = new Queue<NotificationJobData>(notificationQueueName, {
    connection: notificationQueueConnection,
    defaultJobOptions: {
      attempts: parseNumberEnv('NOTIFICATION_JOB_ATTEMPTS', 5),
      backoff: {
        type: 'exponential',
        delay: parseNumberEnv('NOTIFICATION_JOB_BACKOFF_MS', 10000),
      },
      removeOnComplete: true,
      removeOnFail: true,
    },
  });

  async enqueue(job: NotificationJobData): Promise<void> {
    await this.queue.add(job.type, job, {
      jobId: getNotificationJobId(job),
    });

    console.log(
      `[NotificationQueue] Enqueued ${job.type} notification for will ${job.willId}`
    );
  }

  async close(): Promise<void> {
    await this.queue.close();
    notificationQueueConnection.disconnect();
  }
}

export const notificationQueue = new NotificationQueueService();
