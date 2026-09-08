const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordhash',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'jwt_secret',
  'secret',
  'authorization',
  'apikey',
  'api_key',
  'cookie',
  'creditcard',
  'ssn',
  'latitude',
  'longitude'
]);

function redactSensitiveData(data: any, depth = 0, seen = new WeakSet()): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (depth > 6) return '[MAX_DEPTH]';
  if (seen.has(data)) return '[CIRCULAR]';
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, depth + 1, seen));
  }

  const clean: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey)) {
      clean[key] = '[REDACTED]';
    } else {
      clean[key] = redactSensitiveData(data[key], depth + 1, seen);
    }
  }
  return clean;
}

/**
 * Structured JSON Logger for Production-Ready Observability
 */
export const logger = {
  log(level: string, event: string, message: string, metadata: Record<string, any> = {}) {
    const cleanMeta = redactSensitiveData(metadata);
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      service: 'wfa-api',
      event,
      message,
      ...cleanMeta,
    };
    console.log(JSON.stringify(logData));
  },

  info(event: string, message: string, metadata: Record<string, any> = {}) {
    this.log('INFO', event, message, metadata);
  },

  warn(event: string, message: string, metadata: Record<string, any> = {}) {
    this.log('WARN', event, message, metadata);
  },

  error(event: string, message: string, metadata: Record<string, any> = {}) {
    this.log('ERROR', event, message, metadata);
  }
};

export default logger;
