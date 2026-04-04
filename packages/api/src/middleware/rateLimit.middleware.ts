import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

type RateLimitMap = Map<string, RateLimitEntry>;

const stores = new Map<string, RateLimitMap>();

/**
 * In-memory rate limiter.
 * @param maxRequests Maximum requests allowed in the window
 * @param windowMs Window size in milliseconds
 * @param keyFn Function to extract the rate limit key from the request
 */
export function rateLimit(
  maxRequests: number,
  windowMs: number,
  keyFn: (req: Request) => string = (req) => req.ip || 'unknown'
) {
  const storeName = `${maxRequests}-${windowMs}`;
  if (!stores.has(storeName)) {
    stores.set(storeName, new Map());
  }
  const store = stores.get(storeName)!;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyFn(req);
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return next(new ApiError(429, 'RATE_LIMIT_EXCEEDED', `Rate limit exceeded. Try again in ${retryAfter}s`));
    }

    entry.count++;
    next();
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 60000);
