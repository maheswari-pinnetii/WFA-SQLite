import { Request, Response, NextFunction } from 'express';

// In-memory store for idempotency keys.
// In a production environment, this should be backed by Redis or the database.
const idempotencyStore = new Map<string, { status: number; body: any; timestamp: number }>();

// Clean up old idempotency keys after 24 hours
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to mutations
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    // We could enforce it here, but for now we make it optional to avoid breaking existing clients.
    // If you want strict enforcement: return res.status(400).json({ error: 'Idempotency-Key header is required' });
    return next();
  }

  const now = Date.now();
  const cachedResponse = idempotencyStore.get(idempotencyKey);

  if (cachedResponse) {
    if (now - cachedResponse.timestamp < EXPIRATION_MS) {
      // Return the cached response
      console.log(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
      return res.status(cachedResponse.status).json(cachedResponse.body);
    } else {
      // Expired, clear it
      idempotencyStore.delete(idempotencyKey);
    }
  }

  // Intercept the response to save it
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Only cache successful responses (2xx) or specific errors
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyStore.set(idempotencyKey, {
        status: res.statusCode,
        body,
        timestamp: Date.now(),
      });
      console.log(`[Idempotency] Cached response for key: ${idempotencyKey}`);
    }
    return originalJson(body);
  };

  next();
};
