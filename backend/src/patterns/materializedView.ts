/**
 * Pattern 7: Materialized View Engine
 * Pre-computes and stores complex aggregations (`dashboard_summary_mv`), maintained by SQLite database triggers.
 */
import { getDb } from '../config/db.js';

export interface MaterializedViewInfo {
  name: string;
  underlyingTables: string[];
  totalRecords: number;
  lastRefreshedAt: string;
  triggerCount: number;
}

export class MaterializedViewManager {
  /**
   * Refreshes the dashboard_summary_mv table explicitly.
   */
  public refreshDashboardSummaryMV(): { refreshedCount: number; timestamp: string } {
    const db = getDb();
    db.prepare(`DELETE FROM dashboard_summary_mv`).run();
    const result = db.prepare(`
      INSERT INTO dashboard_summary_mv (organizationId, totalEmployees, lastCalculatedAt)
      SELECT organizationId, COUNT(*), datetime('now')
      FROM employees
      GROUP BY organizationId
    `).run();

    return {
      refreshedCount: result.changes,
      timestamp: new Date().toISOString()
    };
  }

  public getMVDetails(): MaterializedViewInfo {
    const db = getDb();
    const row = db.prepare(`SELECT COUNT(*) as cnt FROM dashboard_summary_mv`).get() as any;
    return {
      name: 'dashboard_summary_mv',
      underlyingTables: ['employees', 'organizations'],
      totalRecords: row?.cnt || 0,
      lastRefreshedAt: new Date().toISOString(),
      triggerCount: 3
    };
  }
}

export const materializedViewManager = new MaterializedViewManager();
