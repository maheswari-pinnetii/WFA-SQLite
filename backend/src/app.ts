import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api.routes.js';
import authFlowRouter from './routes/authFlow.routes.js';
import { initDb, healthCheck } from './config/db.js';
import { configureResilience, globalRateLimiter } from './middleware/resilience.js';
import { inputSanitizer } from './middleware/validateInput.js';
import { csrfProtection, ssrfGuard, prototypePollutionGuard, requestTimeoutGuard } from './middleware/securitySuite.js';
import logger from './config/logger.js';

const app = express();

// Security: Hide backend server identity and technology disclosure
app.disable('x-powered-by');
app.use((req: Request, res: Response, next: NextFunction) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
});

const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'test') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  credentials: true
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
app.use(globalRateLimiter);

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

// Detailed API Health Monitor & System Metrics
app.get('/health/metrics', async (req: Request, res: Response) => {
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

// Register routers
app.use('/api/auth', authFlowRouter);
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

// Global Error Handler - Never expose backend internals or database details
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('http.error', err.message || 'Internal Server Error', {
    requestId: (req as any).requestId || 'unknown',
    method: req.method,
    route: req.originalUrl,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Never expose internal database errors or sensitive file paths
  const isSqlError = err.message && (err.message.includes('SQLITE_') || err.message.includes('SqliteError'));
  const safeMessage = (isSqlError || process.env.NODE_ENV === 'production')
    ? 'An unexpected error occurred. Please try again later.'
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    message: safeMessage
  });
});

export { app };
