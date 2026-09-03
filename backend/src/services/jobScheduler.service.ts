import { execute, query } from '../database/sqlite-cloud.js';
import logger from '../config/logger.js';

export type JobHandler = (payload: any) => Promise<void>;

class JobSchedulerService {
  private handlers: Map<string, JobHandler> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;

  registerHandler(name: string, handler: JobHandler) {
    this.handlers.set(name, handler);
  }

  start(pollIntervalMs: number = 10000) {
    if (this.timer) return;
    logger.info('job_scheduler.started', `Delayed job scheduler polling every ${pollIntervalMs}ms`);
    this.timer = setInterval(() => {
      void this.processPendingJobs();
    }, pollIntervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async schedule(name: string, payload: any, delayMs: number = 0, maxAttempts: number = 3): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();
    const runAt = new Date(now.getTime() + delayMs).toISOString();
    const createdAt = now.toISOString();

    await execute(
      `INSERT INTO delayed_jobs (id, name, payload, status, run_at, attempts, max_attempts, created_at, updated_at)
       VALUES (?, ?, ?, 'PENDING', ?, 0, ?, ?, ?)`,
      [id, name, JSON.stringify(payload), runAt, maxAttempts, createdAt, createdAt]
    );

    logger.info('job_scheduler.scheduled', `Scheduled job [${name}] (id: ${id}) to run at ${runAt}`);
    return id;
  }

  async processPendingJobs(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date().toISOString();
      const pending = await query<any>(
        `SELECT * FROM delayed_jobs 
         WHERE status = 'PENDING' AND run_at <= ? 
         ORDER BY run_at ASC LIMIT 10`,
        [now]
      );

      for (const job of pending) {
        const handler = this.handlers.get(job.name);
        if (!handler) {
          logger.warn('job_scheduler.no_handler', `No handler registered for job [${job.name}]`);
          continue;
        }

        // Mark running
        const updatedNow = new Date().toISOString();
        await execute(
          `UPDATE delayed_jobs SET status = 'RUNNING', attempts = attempts + 1, updated_at = ? WHERE id = ?`,
          [updatedNow, job.id]
        );

        let parsedPayload: any = {};
        try {
          if (job.payload) parsedPayload = JSON.parse(job.payload);
        } catch (_) {}

        try {
          await handler(parsedPayload);
          // Mark completed
          await execute(
            `UPDATE delayed_jobs SET status = 'COMPLETED', updated_at = ? WHERE id = ?`,
            [new Date().toISOString(), job.id]
          );
          logger.info('job_scheduler.completed', `Job [${job.name}] (id: ${job.id}) completed successfully.`);
        } catch (err: any) {
          logger.error('job_scheduler.failed', `Job [${job.name}] (id: ${job.id}) failed: ${err.message}`);
          const isFinalFailure = job.attempts + 1 >= job.max_attempts;
          const nextRunAt = new Date(Date.now() + 30000 * Math.pow(2, job.attempts)).toISOString();

          await execute(
            `UPDATE delayed_jobs 
             SET status = ?, run_at = ?, last_error = ?, updated_at = ? 
             WHERE id = ?`,
            [
              isFinalFailure ? 'FAILED' : 'PENDING',
              nextRunAt,
              err.message,
              new Date().toISOString(),
              job.id
            ]
          );
        }
      }
    } catch (err: any) {
      logger.error('job_scheduler.poll_error', `Error processing pending jobs: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }
}

export const jobScheduler = new JobSchedulerService();
