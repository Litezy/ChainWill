"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRedisConnection = createRedisConnection;
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
function parseNumberEnv(name, fallback) {
    const rawValue = process.env[name];
    if (!rawValue) {
        return fallback;
    }
    const parsedValue = Number.parseInt(rawValue, 10);
    return Number.isNaN(parsedValue) ? fallback : parsedValue;
}
function createRedisConnection() {
    const tlsEnabled = process.env.REDIS_TLS === 'true';
    const baseOptions = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
        ...(tlsEnabled ? { tls: {} } : {}),
    };
    if (process.env.REDIS_URL) {
        return new ioredis_1.default(process.env.REDIS_URL, baseOptions);
    }
    return new ioredis_1.default({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseNumberEnv('REDIS_PORT', 6379),
        db: parseNumberEnv('REDIS_DB', 0),
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined,
        ...baseOptions,
    });
}
