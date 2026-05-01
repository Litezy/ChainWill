import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import willRoutes from './routes/will.routes';
import { web3EventService } from './services/web3EventService';
import { prisma } from './config/db';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/wills', willRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbConnected = (global as any).dbConnected || false;
  res.status(200).json({
    status: 'OK',
    message: 'ChainWill API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    web3Services: dbConnected && web3EventService.isHealthy() ? 'running' : 'stopped',
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
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await web3EventService.stop();
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await web3EventService.stop();
  await prisma.$disconnect();
  process.exit(1);
});