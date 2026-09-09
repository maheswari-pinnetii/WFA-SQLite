import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import cls from 'cls-hooked';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

const namespace = cls.createNamespace('wfa-namespace');

export const getTraceId = () => {
  return namespace.get('traceId') || 'no-trace-id';
};

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  namespace.bindEmitter(req);
  namespace.bindEmitter(res);

  namespace.run(() => {
    const traceId = req.headers['x-request-id'] || uuidv4();
    namespace.set('traceId', traceId);
    res.setHeader('x-request-id', traceId);
    next();
  });
};

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] [trace:${getTraceId()}]: ${message}`;
  if (Object.keys(metadata).length > 0 && metadata.service !== 'wfa-backend') {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    customFormat
  ),
  defaultMeta: { service: 'wfa-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ],
});
