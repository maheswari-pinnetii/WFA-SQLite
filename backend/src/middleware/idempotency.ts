import { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  status: number;
  body: any;
  timestamp: number;
}

// In-memory store for idempotency keys.
const idempotencyStore = new Map<string, CachedResponse>();
const inFlightRequests = new Map<string, Promise<CachedResponse>>();
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Only apply to mutations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const rawKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'] || req.header('idempotency-key') || req.header('x-idempotency-key');
  const idempotencyKey = typeof rawKey === 'string' ? rawKey.trim() : Array.isArray(rawKey) ? rawKey[0].trim() : '';

  if (!idempotencyKey) {
    return next();
  }

  const now = Date.now();
  const cachedResponse = idempotencyStore.get(idempotencyKey);

  if (cachedResponse) {
    if (now - cachedResponse.timestamp < EXPIRATION_MS) {
      return res.status(cachedResponse.status).json(cachedResponse.body);
    } else {
      idempotencyStore.delete(idempotencyKey);
    }
  }

  // If a concurrent request with the same key is already in flight, wait for it to complete
  if (inFlightRequests.has(idempotencyKey)) {
    try {
      const result = await inFlightRequests.get(idempotencyKey)!;
      return res.status(result.status).json(result.body);
    } catch (_) {
      // If in-flight request failed, allow next attempt
    }
  }

  let resolveInFlight!: (val: CachedResponse) => void;
  let rejectInFlight!: (err: any) => void;
  const inFlightPromise = new Promise<CachedResponse>((resolve, reject) => {
    resolveInFlight = resolve;
    rejectInFlight = reject;
  });
  inFlightRequests.set(idempotencyKey, inFlightPromise);

  // Intercept the response to save it
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    const cached: CachedResponse = {
      status: res.statusCode,
      body,
      timestamp: Date.now(),
    };

    if (res.statusCode < 500) {
      idempotencyStore.set(idempotencyKey, cached);
    }

    inFlightRequests.delete(idempotencyKey);
    resolveInFlight(cached);
    return originalJson(body);
  };

  next();
};
