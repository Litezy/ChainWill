"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationQueue = exports.NotificationQueueService = exports.notificationQueueName = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
function parseNumberEnv(name, fallback) {
    const rawValue = process.env[name];
    if (!rawValue) {
        return fallback;
    }
    const parsedValue = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
}
exports.notificationQueueName = process.env.NOTIFICATION_QUEUE_NAME || 'chainwill-notifications';
const notificationQueueConnection = (0, redis_1.createRedisConnection)();
notificationQueueConnection.on('error', (error) => {
    console.error('[NotificationQueue] Redis connection error:', error);
});
function getNotificationJobId(job) {
    return `${job.type}:${job.willId}`;
}
class NotificationQueueService {
    queue = new bullmq_1.Queue(exports.notificationQueueName, {
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
    async enqueue(job) {
        await this.queue.add(job.type, job, {
            jobId: getNotificationJobId(job),
        });
        console.log(`[NotificationQueue] Enqueued ${job.type} notification for will ${job.willId}`);
    }
    async close() {
        await this.queue.close();
        notificationQueueConnection.disconnect();
    }
}
exports.NotificationQueueService = NotificationQueueService;
exports.notificationQueue = new NotificationQueueService();
