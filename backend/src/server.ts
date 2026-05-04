import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import willRoutes from './routes/will.routes';
import platformRoutes from './routes/platform.routes';
import { notificationQueue } from './queues/notificationQueue';
import { web3EventService } from './services/web3EventService';
import { prisma } from './config/db';
import { notificationWorker } from './workers/notificationWorker';

dotenv.config();

const app = express();
const shouldAutostartNotificationWorker =
  process.env.NOTIFICATION_WORKER_AUTOSTART !== 'false';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/wills', willRoutes);
app.use('/api/platform', platformRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbConnected = (global as any).dbConnected || false;
  const web3Status = web3EventService.getStatus();
  res.status(200).json({
    status: 'OK',
    message: 'ChainWill API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    web3Services:
      dbConnected && web3EventService.isHealthy() ? 'running' : 'stopped',
    relayer: dbConnected
      ? web3Status.inactivityMonitor
      : {
          running: false,
          configured: false,
          relayerAddress: null,
          lastCompletedAt: null,
        },
    notifications:
      dbConnected && notificationWorker.isHealthy() ? 'running' : 'stopped',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 8000;

// Start server and services
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  let dbConnected = false;
  try {
    await prisma.$connect();
    console.log('✓ Database connection established');
    dbConnected = true;
  } catch (error) {
    console.warn('⚠ Database connection failed:', error instanceof Error ? error.message : error);
    console.warn('⚠ Server will run without database. Some endpoints may not work.');
    console.warn('⚠ Check your DATABASE_URL and ensure Supabase is accessible.');
  }

  // Store db status globally for health checks
  (global as any).dbConnected = dbConnected;

  if (dbConnected) {
    try {
      if (shouldAutostartNotificationWorker) {
        await notificationWorker.start();
      } else {
        console.log('[Server] Notification worker autostart disabled');
      }

      // Start Web3 event listeners and background jobs only if DB is connected
      await web3EventService.start();
    } catch (error) {
      console.error('Failed to start Web3 services:', error);
      // Continue running the server even if services fail to start
    }
  } else {
    console.warn('Web3 services disabled until database connection is available');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await web3EventService.stop();
    await notificationWorker.stop();
    await notificationQueue.close();
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await web3EventService.stop();
    await notificationWorker.stop();
    await notificationQueue.close();
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await web3EventService.stop();
  await notificationWorker.stop();
  await notificationQueue.close();
  await prisma.$disconnect();
  process.exit(1);
});
