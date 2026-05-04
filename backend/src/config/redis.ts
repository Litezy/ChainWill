import dotenv from 'dotenv';
import IORedis from 'ioredis';

dotenv.config();

function parseNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

export function createRedisConnection(): IORedis {
  const tlsEnabled = process.env.REDIS_TLS === 'true';
  const baseOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    ...(tlsEnabled ? { tls: {} } : {}),
  };

  if (process.env.REDIS_URL) {
    return new IORedis(process.env.REDIS_URL, baseOptions);
  }

  return new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseNumberEnv('REDIS_PORT', 6379),
    db: parseNumberEnv('REDIS_DB', 0),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    ...baseOptions,
  });
}
