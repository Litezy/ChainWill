import dotenv from 'dotenv';
import { prisma } from '../config/db';
import { notificationWorker } from './notificationWorker';

dotenv.config();

async function shutdown(signal: string): Promise<void> {
  console.log(`[NotificationWorker] ${signal} received, shutting down`);
  await notificationWorker.stop();
  await prisma.$disconnect();
  process.exit(0);
}

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('[NotificationWorker] Database connection established');
    await notificationWorker.start();
  } catch (error) {
    console.error('[NotificationWorker] Failed to start worker:', error);
    await prisma.$disconnect();
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
  await notificationWorker.stop();
  await prisma.$disconnect();
  process.exit(1);
});

void bootstrap();
