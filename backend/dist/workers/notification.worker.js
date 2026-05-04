"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../config/db");
const notificationWorker_1 = require("./notificationWorker");
dotenv_1.default.config();
async function shutdown(signal) {
    console.log(`[NotificationWorker] ${signal} received, shutting down`);
    await notificationWorker_1.notificationWorker.stop();
    await db_1.prisma.$disconnect();
    process.exit(0);
}
async function bootstrap() {
    try {
        await db_1.prisma.$connect();
        console.log('[NotificationWorker] Database connection established');
        await notificationWorker_1.notificationWorker.start();
    }
    catch (error) {
        console.error('[NotificationWorker] Failed to start worker:', error);
        await db_1.prisma.$disconnect();
        process.exit(1);
    }
}
process.on('SIGINT', () => {
    void shutdown('SIGINT');
});
process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});
process.on('uncaughtException', async (error) => {
    console.error('[NotificationWorker] Uncaught exception:', error);
    await notificationWorker_1.notificationWorker.stop();
    await db_1.prisma.$disconnect();
    process.exit(1);
});
void bootstrap();
