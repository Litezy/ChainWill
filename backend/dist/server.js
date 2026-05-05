"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const will_routes_1 = __importDefault(require("./routes/will.routes"));
const beneficiary_routes_1 = __importDefault(require("./routes/beneficiary.routes"));
const signer_routes_1 = __importDefault(require("./routes/signer.routes"));
const web3EventService_1 = require("./services/web3EventService");
const db_1 = require("./config/db");
const notificationWorker_1 = require("./workers/notificationWorker");
dotenv_1.default.config();
const app = (0, express_1.default)();
const shouldAutostartNotificationWorker = process.env.NOTIFICATION_WORKER_AUTOSTART !== 'false';
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
app.use('/api/wills', will_routes_1.default);
app.use('/api/beneficiary', beneficiary_routes_1.default);
app.use('/api/signer', signer_routes_1.default);
// Health Check Endpoint
app.get('/health', (req, res) => {
    const dbConnected = global.dbConnected || false;
    res.status(200).json({
        status: 'OK',
        message: 'ChainWill API is running',
        database: dbConnected ? 'connected' : 'disconnected',
        web3Services: dbConnected && web3EventService_1.web3EventService.isHealthy() ? 'running' : 'stopped',
        timestamp: new Date().toISOString(),
    });
});
const PORT = process.env.PORT || 8000;
// Start server and services
const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    let dbConnected = false;
    try {
        await db_1.prisma.$connect();
        console.log('✓ Database connection established');
        dbConnected = true;
    }
    catch (error) {
        console.warn('⚠ Database connection failed:', error instanceof Error ? error.message : error);
        console.warn('⚠ Server will run without database. Some endpoints may not work.');
        console.warn('⚠ Check your DATABASE_URL and ensure Supabase is accessible.');
    }
    // Store db status globally for health checks
    global.dbConnected = dbConnected;
    if (dbConnected) {
        try {
            // Start Web3 event listeners and background jobs only if DB is connected
            await web3EventService_1.web3EventService.start();
        }
        catch (error) {
            console.error('Failed to start Web3 services:', error);
            // Continue running the server even if services fail to start
        }
    }
    else {
        console.warn('Web3 services disabled until database connection is available');
    }
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        console.log('HTTP server closed');
        await web3EventService_1.web3EventService.stop();
        await notificationWorker_1.notificationWorker.stop();
        await notificationQueue_1.notificationQueue.close();
        await db_1.prisma.$disconnect();
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(async () => {
        console.log('HTTP server closed');
        await web3EventService_1.web3EventService.stop();
        await notificationWorker_1.notificationWorker.stop();
        await notificationQueue_1.notificationQueue.close();
        await db_1.prisma.$disconnect();
        process.exit(0);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await web3EventService_1.web3EventService.stop();
    await notificationWorker_1.notificationWorker.stop();
    await notificationQueue_1.notificationQueue.close();
    await db_1.prisma.$disconnect();
    process.exit(1);
});
