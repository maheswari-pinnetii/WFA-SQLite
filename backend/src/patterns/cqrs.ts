/**
 * Pattern 3: CQRS (Command Query Responsibility Segregation)
 * Separates write commands (mutations) from optimized read queries/models.
 */
import { getDb } from '../config/db.js';

export interface Command {
  type: string;
  payload: any;
}

export interface Query {
  type: string;
  params: any;
}

export class CQRSModule {
  /**
   * Command side: Performs transactional mutations and emits state changes.
   */
  public async executeCommand(command: Command): Promise<{ success: boolean; eventId?: string }> {
    const db = getDb();
    if (command.type === 'PUNCH_ATTENDANCE') {
      const { employeeId, type, date } = command.payload;
      const eventId = `evt-${Date.now()}`;
      
      db.prepare(`
        CREATE TABLE IF NOT EXISTS attendance_events (
          id TEXT PRIMARY KEY,
          employeeId TEXT,
          eventType TEXT,
          timestamp TEXT,
          payload TEXT
        )
      `).run();

      db.prepare(`
        INSERT INTO attendance_events (id, employeeId, eventType, timestamp, payload)
        VALUES (?, ?, ?, datetime('now'), ?)
      `).run(eventId, employeeId, type, JSON.stringify(command.payload));

      return { success: true, eventId };
    }

    return { success: false };
  }

  /**
   * Query side: Reads directly from pre-aggregated read models for fast execution.
   */
  public async executeQuery(query: Query): Promise<any> {
    const db = getDb();
    if (query.type === 'GET_DASHBOARD_SUMMARY') {
      const row = db.prepare(`SELECT * FROM dashboard_summary_mv LIMIT 1`).get();
      return row || { totalEmployees: 0, lastCalculatedAt: new Date().toISOString() };
    }

    if (query.type === 'GET_EMPLOYEE_ANALYTICS') {
      return db.prepare(`
        SELECT department, COUNT(*) as count 
        FROM employees 
        GROUP BY department
      `).all();
    }

    return null;
  }
}

export const cqrsModule = new CQRSModule();
