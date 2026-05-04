"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationWorker = exports.NotificationWorkerService = void 0;
const bullmq_1 = require("bullmq");
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const notificationQueue_1 = require("../queues/notificationQueue");
const alertDispatcher_1 = require("../services/alertDispatcher");
function parseNumberEnv(name, fallback) {
    const rawValue = process.env[name];
    if (!rawValue) {
        return fallback;
    }
    const parsedValue = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
}
class NotificationWorkerService {
    worker = null;
    isRunning = false;
    async start() {
        if (this.worker) {
            console.warn('[NotificationWorker] Worker already running');
            return;
        }
        const connection = (0, redis_1.createRedisConnection)();
        connection.on('error', (error) => {
            console.error('[NotificationWorker] Redis connection error:', error);
        });
        this.worker = new bullmq_1.Worker(notificationQueue_1.notificationQueueName, async (job) => {
            await this.process(job);
        }, {
            connection,
            concurrency: parseNumberEnv('NOTIFICATION_WORKER_CONCURRENCY', 5),
        });
        this.worker.on('completed', (job) => {
            console.log(`[NotificationWorker] Completed ${job.name} notification for will ${job.data.willId}`);
        });
        this.worker.on('failed', (job, error) => {
            console.error(`[NotificationWorker] Failed ${job?.name ?? 'unknown'} notification:`, error);
            if (job && this.isFinalAttempt(job)) {
                void this.releaseQueuedState(job.data);
            }
        });
        this.worker.on('error', (error) => {
            console.error('[NotificationWorker] Worker error:', error);
        });
        await this.worker.waitUntilReady();
        this.isRunning = true;
        console.log(`[NotificationWorker] Listening on queue "${notificationQueue_1.notificationQueueName}"`);
    }
    async stop() {
        if (!this.worker) {
            return;
        }
        await this.worker.close();
        this.worker = null;
        this.isRunning = false;
        console.log('[NotificationWorker] Worker stopped');
    }
    isHealthy() {
        return this.isRunning;
    }
    async process(job) {
        const payload = alertDispatcher_1.alertDispatcher.buildEmailPayload(job.data);
        await alertDispatcher_1.alertDispatcher.sendAlertEmail(payload);
        await this.markAsSent(job.data);
    }
    async markAsSent(job) {
        if (job.type === 'attestation-open') {
            await db_1.prisma.will.update({
                where: { id: job.willId },
                data: {
                    attestationAlertEnqueuedAt: null,
                    attestationAlertSentAt: new Date(),
                },
            });
            return;
        }
        await db_1.prisma.will.update({
            where: { id: job.willId },
            data: {
                fundingRiskAlertEnqueuedAt: null,
                fundingRiskAlertSentAt: new Date(),
            },
        });
    }
    async releaseQueuedState(job) {
        try {
            if (job.type === 'attestation-open') {
                await db_1.prisma.will.update({
                    where: { id: job.willId },
                    data: {
                        attestationAlertEnqueuedAt: null,
                    },
                });
                return;
            }
            await db_1.prisma.will.update({
                where: { id: job.willId },
                data: {
                    fundingRiskAlertEnqueuedAt: null,
                },
            });
        }
        catch (error) {
            console.error(`[NotificationWorker] Failed to release queue state for will ${job.willId}:`, error);
        }
    }
    isFinalAttempt(job) {
        const configuredAttempts = typeof job.opts.attempts === 'number' ? job.opts.attempts : 1;
        return job.attemptsMade >= configuredAttempts;
    }
}
exports.NotificationWorkerService = NotificationWorkerService;
exports.notificationWorker = new NotificationWorkerService();
