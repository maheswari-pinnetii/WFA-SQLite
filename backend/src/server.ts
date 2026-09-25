import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { app } from './app.js';
import { initSockets } from './sockets/index.js';
import { getDb } from './config/db.js';
import { logger } from './config/logger.js';

const PORT = Number(process.env.PORT || 5001);

let server: http.Server;
let io: SocketServer;

if (process.env.NODE_ENV !== 'test') {
  server = http.createServer(app);
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  io = new SocketServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  initSockets(io);

  // Initialize delayed job scheduler & default feature flags
  import('./modules/core/jobScheduler.service.js').then(({ jobScheduler }) => {
    jobScheduler.start(10000);
  });
  import('./modules/core/featureFlag.service.js').then(({ featureFlagService }) => {
    featureFlagService.initDefaults().catch(() => undefined);
  });

  const startServer = (currentPort: number, maxRetries: number = 5) => {
    let attempts = 0;

    const listenOnPort = (port: number) => {
      const onError = (err: any) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn('server.port_in_use', `Port ${port} is currently in use.`);
          if (attempts < maxRetries) {
            attempts++;
            const nextPort = port + 1;
            logger.info('server.port_retry', `Attempting to bind to alternative port ${nextPort} (${attempts}/${maxRetries})...`);
            server.removeListener('error', onError);
            listenOnPort(nextPort);
          } else {
            logger.error('server.port_in_use_fatal', `Failed to find an available port after ${maxRetries} retries starting from ${currentPort}.`);
            process.exit(1);
          }
        } else {
          logger.error('server.error', 'Server error occurred', { error: err.message });
          process.exit(1);
        }
      };

      server.once('error', onError);

      server.listen(port, () => {
        server.removeListener('error', onError);
        const env = process.env.NODE_ENV || 'development';
        console.log('');
        console.log('┌─────────────────────────────────────────────────┐');
        console.log('│         Stackly WFA Backend — RUNNING            │');
        console.log('├─────────────────────────────────────────────────┤');
        console.log(`│  Environment : ${env.padEnd(32)}│`);
        console.log(`│  Server      : http://localhost:${port}             │`);
        console.log(`│  Health      : http://localhost:${port}/api/health   │`);
        console.log(`│  API         : http://localhost:${port}/api/v1       │`);
        console.log('│  Database    : SQLite (WAL mode)                 │');
        console.log('└─────────────────────────────────────────────────┘');
        console.log('');
        logger.info('server.startup', `Backend API with Socket.io running on http://localhost:${port}`);
      });
    };

    listenOnPort(currentPort);
  };

  startServer(PORT);
} else {
  server = http.createServer(app);
}

// Graceful Shutdown Handler
const handleGracefulShutdown = (signal: string) => {
  logger.info('server.shutdown.initiated', `Received ${signal}. Starting graceful shutdown...`);
  
  const shutdownAll = async () => {
    try {
      if (io) {
        await new Promise<void>((resolve) => io.close(() => resolve()));
        logger.info('server.shutdown.sockets_closed', 'Socket.IO connections closed.');
      }
      const db = getDb();
      if (db) {
        db.close();
        logger.info('server.shutdown.db_closed', 'SQLite database connection closed.');
      }
      process.exit(0);
    } catch (err: any) {
      logger.error('server.shutdown.error', 'Error during graceful shutdown', { error: err.message });
      process.exit(1);
    }
  };

  if (server) {
    server.close(async () => {
      logger.info('server.shutdown.http_closed', 'Express HTTP server closed.');
      await shutdownAll();
    });
    
    // Force shutdown if connections do not close in 10s
    setTimeout(() => {
      logger.error('server.shutdown.forced', 'Forcing server shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export { app, server };



