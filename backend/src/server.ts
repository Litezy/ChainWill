import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import communicationRoutes from './routes/communication.routes';
import { prisma } from './config/db';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/communication', communicationRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const dbConnected = Boolean((global as { dbConnected?: boolean }).dbConnected);
  res.status(200).json({
    status: 'OK',
    message: 'ChainWill communication API is running',
    database: dbConnected ? 'connected' : 'disconnected',
    services: {
      email: 'running',
      otp: dbConnected ? 'running' : 'stopped',
    },
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
  (global as { dbConnected?: boolean }).dbConnected = dbConnected;
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});
