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
const web3EventService_1 = require("./services/web3EventService");
const db_1 = require("./config/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
app.use('/api/wills', will_routes_1.default);
// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'ChainWill API is running',
        web3Services: web3EventService_1.web3EventService.isHealthy() ? 'running' : 'stopped',
    });
});
const PORT = process.env.PORT || 8000;
// Start server and services
const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await db_1.prisma.$connect();
        console.log('Database connection established');
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
    try {
        // Start Web3 event listeners and background jobs
        await web3EventService_1.web3EventService.start();
    }
    catch (error) {
        console.error('Failed to start Web3 services:', error);
        // Continue running the server even if services fail to start
    }
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(async () => {
        console.log('HTTP server closed');
        await web3EventService_1.web3EventService.stop();
        await db_1.prisma.$disconnect();
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(async () => {
        console.log('HTTP server closed');
        await web3EventService_1.web3EventService.stop();
        await db_1.prisma.$disconnect();
        process.exit(0);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error);
    await web3EventService_1.web3EventService.stop();
    await db_1.prisma.$disconnect();
    process.exit(1);
});
