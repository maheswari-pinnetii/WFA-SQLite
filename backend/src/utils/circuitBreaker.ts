import logger from '../config/logger.js';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of consecutive failures to trip open
  recoveryTimeMs?: number; // Time in ms to stay OPEN before trying HALF_OPEN
  timeoutMs?: number; // Timeout for protected call
}

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private failureThreshold: number;
  private recoveryTimeMs: number;
  private timeoutMs: number;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTimeMs = options.recoveryTimeMs || 30000; // 30 seconds
    this.timeoutMs = options.timeoutMs || 10000; // 10 seconds
  }

  getState(): CircuitState {
    // If OPEN and recovery window elapsed, transition to HALF_OPEN
    if (this.state === 'OPEN' && Date.now() - this.lastFailureTime > this.recoveryTimeMs) {
      this.state = 'HALF_OPEN';
      logger.info('circuit_breaker.half_open', `Circuit breaker [${this.name}] entering HALF_OPEN probe state`);
    }
    return this.state;
  }

  async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      logger.warn('circuit_breaker.short_circuit', `Circuit breaker [${this.name}] is OPEN. Executing fallback immediately.`);
      if (fallback) {
        return await fallback();
      }
      throw new Error(`Circuit breaker [${this.name}] is OPEN: Service temporarily unavailable.`);
    }

    try {
      // Execute with timeout guard
      const result = await Promise.race([
        action(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Operation timed out after ${this.timeoutMs}ms`)), this.timeoutMs)
        )
      ]);

      // Success in CLOSED or HALF_OPEN
      if (this.state === 'HALF_OPEN') {
        logger.info('circuit_breaker.recovered', `Circuit breaker [${this.name}] successfully recovered. Transitioning to CLOSED.`);
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
      return result;
    } catch (err: any) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      logger.error('circuit_breaker.failure', `Circuit breaker [${this.name}] failure #${this.failureCount}: ${err.message}`);

      if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
        this.state = 'OPEN';
        logger.error('circuit_breaker.tripped', `Circuit breaker [${this.name}] TRIPPED to OPEN state for ${this.recoveryTimeMs}ms.`);
      }

      if (fallback) {
        logger.info('circuit_breaker.fallback', `Executing fallback for [${this.name}] after error: ${err.message}`);
        return await fallback();
      }
      throw err;
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}
