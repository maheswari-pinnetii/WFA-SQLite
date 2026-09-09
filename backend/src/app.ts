import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api.routes.js';
import { initDb, healthCheck } from './config/db.js';
import { configureResilience } from './middleware/resilience.js';
import { globalApiLimiter } from './middleware/rateLimiter.js';
import { inputSanitizer } from './middleware/validateInput.js';
import { csrfProtection, ssrfGuard, prototypePollutionGuard, requestTimeoutGuard } from './middleware/securitySuite.js';
import { authenticateToken, authorizeRoles } from './middleware/auth.js';
import { logger } from './config/logger.js';
import { AppError, ErrorCode, sendError } from './utils/apiError.js';

const app = express();

// Security: Hide backend server identity and technology disclosure
app.disable('x-powered-by');
app.use((req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
});

// ─── CORS Configuration ───────────────────────────────────────────────────────
// Dev defaults; override in production via ALLOWED_ORIGINS env var
const devDefaults = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : devDefaults;

// In non-production environments also allow the dev defaults so local dev still works
if (process.env.NODE_ENV !== 'production') {
  for (const dev of devDefaults) {
    if (!allowedOrigins.includes(dev)) allowedOrigins.push(dev);
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server (no origin) and test environments
    if (!origin || process.env.NODE_ENV === 'test') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn('security.cors.rejected', `Blocked CORS request from unlisted origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Idempotency-Key'],
  credentials: true,
}));
app.use(requestTimeoutGuard(30000));
app.use(express.json({ limit: '10mb' }));
app.use(prototypePollutionGuard);
app.use(inputSanitizer);
app.use(csrfProtection);
app.use(ssrfGuard);

// Apply Helmet, compression, request ID tracking, and logging
configureResilience(app);

// Apply Global Rate Limiting
app.use(globalApiLimiter);

// Liveness Health Check
app.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Readiness Health Check (checks if SQLite database connection is active)
app.get('/ready', async (req: Request, res: Response) => {
  try {
    const isHealthy = await healthCheck();
    if (isHealthy) {
      res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
    } else {
      throw new Error('Database ping query returned no results');
    }
  } catch (err: any) {
    logger.error('health.readiness.failed', 'Database connection not ready.', { error: err.message });
    res.status(503).json({ status: 'DOWN', reason: 'Database connection failed' });
  }
});

// Generic Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Detailed API Health Monitor & System Metrics (Protected)
app.get('/health/metrics', authenticateToken as any, authorizeRoles(['ADMIN']) as any, async (req: Request, res: Response) => {
  const startTime = Date.now();
  let dbHealthy = false;
  let dbLatencyMs = 0;
  try {
    dbHealthy = await healthCheck();
    dbLatencyMs = Date.now() - startTime;
  } catch (_) {}

  const mem = process.memoryUsage();
  const io = (await import('./sockets/socketEmitter.js')).getIO();
  const activeSockets = io ? io.engine?.clientsCount || 0 : 0;

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: 'SQLite (WAL mode)',
      connected: dbHealthy,
      latencyMs: dbLatencyMs
    },
    realtimeSockets: {
      activeConnections: activeSockets
    },
    memory: {
      rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version
    }
  });
});



// API Routes (Canonical /api/v1 only)

app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);
app.use('/api', apiRouter);

// Database initialization
if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    logger.info('database.initialization', 'Database initialized successfully.');
  }).catch((err: any) => {
    logger.error('database.initialization.failed', 'Failed to initialize database', { error: err.message });
  });
}

// Global Error Handler — standard AppError format, never leaks internals
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  sendError(res, err, req);
});

export { app };





