import type { NextFunction, Request, RequestHandler, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message: string;
}

interface HitRecord {
  count: number;
  resetAt: number;
}

function getClientIdentifier(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
    return forwardedFor.split(',')[0]?.trim() || req.ip || 'unknown';
  }

  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function createBasicRateLimit(
  options: RateLimitOptions
): RequestHandler {
  const hits = new Map<string, HitRecord>();
  let requestCounter = 0;

  function purgeExpiredEntries(now: number): void {
    for (const [key, value] of hits.entries()) {
      if (value.resetAt <= now) {
        hits.delete(key);
      }
    }
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();

    requestCounter += 1;
    if (requestCounter % 100 === 0) {
      purgeExpiredEntries(now);
    }

    const clientId = getClientIdentifier(req);
    const current = hits.get(clientId);

    if (!current || current.resetAt <= now) {
      const resetAt = now + options.windowMs;
      hits.set(clientId, {
        count: 1,
        resetAt,
      });

      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(options.maxRequests - 1));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
      next();
      return;
    }

    current.count += 1;
    hits.set(clientId, current);

    const remaining = Math.max(options.maxRequests - current.count, 0);
    const retryAfterSeconds = Math.max(
      Math.ceil((current.resetAt - now) / 1000),
      1
    );

    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));

    if (current.count > options.maxRequests) {
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: options.message,
        retryAfterSeconds,
      });
      return;
    }

    next();
  };
}
