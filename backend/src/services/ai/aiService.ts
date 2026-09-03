import { query, execute } from '../../database/sqlite-cloud.js';
import { AIInsight, AnalyticsContext, AIProvider } from './aiProvider.interface.js';
import { statisticalEngine } from './statisticalEngine.js';
import { CircuitBreaker } from '../../utils/circuitBreaker.js';
import { emitToRole, emitToDept } from '../../sockets/socketEmitter.js';
import { SOCKET_EVENTS } from '../../sockets/events.js';
import logger from '../../config/logger.js';

class StatisticalAIProvider implements AIProvider {
  name = 'statistical-deterministic-engine';

  async generateInsights(context: AnalyticsContext): Promise<AIInsight[]> {
    return statisticalEngine.analyzeWorkforceData(context);
  }
}

class AIService {
  private activeProvider: AIProvider = new StatisticalAIProvider();
  private circuitBreaker = new CircuitBreaker('AI_WORKFORCE_SERVICE', {
    failureThreshold: 3,
    recoveryTimeMs: 20000,
    timeoutMs: 8000
  });

  private lastRunTime: number = 0;
  private debounceTimer: NodeJS.Timeout | null = null;
  private minIntervalMs: number = 15000; // Throttle to max once every 15s

  setProvider(provider: AIProvider) {
    this.activeProvider = provider;
  }

  /**
   * Schedules a debounced AI analysis pass after real-time events.
   */
  triggerDebouncedAnalysis(orgId: string = 'org-stackly') {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const elapsed = Date.now() - this.lastRunTime;
    const delay = elapsed >= this.minIntervalMs ? 2000 : this.minIntervalMs - elapsed;

    this.debounceTimer = setTimeout(() => {
      void this.runWorkforceAnalysis(orgId);
    }, delay);
  }

  /**
   * Gathers aggregated, anonymized metrics from SQLite and executes AI insight generation.
   */
  async runWorkforceAnalysis(orgId: string = 'org-stackly'): Promise<AIInsight[]> {
    this.lastRunTime = Date.now();
    try {
      const today = new Date().toISOString().substring(0, 10);

      // 1. Fetch total active employees
      const empRows = await query<any>(
        `SELECT COUNT(*) as count FROM employees WHERE organizationId = ? AND status = 'ACTIVE'`,
        [orgId]
      );
      const totalEmployees = empRows[0]?.count || 500;

      // 2. Fetch today's attendance snapshot
      const todayRows = await query<any>(
        `SELECT status, COUNT(*) as count FROM attendancerecords 
         WHERE organizationId = ? AND date = ? GROUP BY status`,
        [orgId, today]
      );
      let presentToday = 0;
      let onBreakToday = 0;
      for (const r of todayRows) {
        if (r.status === 'Present') presentToday = r.count;
        if (r.status === 'On Break') onBreakToday = r.count;
      }

      // 3. Count late arrivals today (check-in after 09:30)
      const lateRows = await query<any>(
        `SELECT COUNT(*) as count FROM attendancerecords 
         WHERE organizationId = ? AND date = ? AND checkInTime > '09:30'`,
        [orgId, today]
      );
      const lateToday = lateRows[0]?.count || 0;
      const absentToday = Math.max(0, totalEmployees - (presentToday + onBreakToday));

      // 4. Fetch 14-day history for baseline
      const historyRows = await query<any>(
        `SELECT date, 
                SUM(CASE WHEN status IN ('Present', 'On Break', 'Checked Out') THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN checkInTime > '09:30' THEN 1 ELSE 0 END) as late
         FROM attendancerecords 
         WHERE organizationId = ? AND date != ?
         GROUP BY date ORDER BY date DESC LIMIT 14`,
        [orgId, today]
      );

      const attendanceHistory = historyRows.map((h: any) => ({
        date: h.date,
        present: Number(h.present) || 0,
        absent: Math.max(0, totalEmployees - (Number(h.present) || 0)),
        late: Number(h.late) || 0
      }));

      // 5. Fetch pending leave requests
      const leaveRows = await query<any>(
        `SELECT COUNT(*) as count FROM leaverequests 
         WHERE organizationId = ? AND status = 'PENDING'`,
        [orgId]
      );
      const leaveRequestsPending = leaveRows[0]?.count || 0;

      const context: AnalyticsContext = {
        organizationId: orgId,
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        onBreakToday,
        attendanceHistory,
        leaveRequestsPending
      };

      // Execute AI generation guarded by circuit breaker
      const generatedInsights = await this.circuitBreaker.execute(
        async () => await this.activeProvider.generateInsights(context),
        async () => statisticalEngine.analyzeWorkforceData(context) // Fallback to deterministic statistical engine
      );

      // Persist new insights in SQLite
      for (const insight of generatedInsights) {
        await execute(
          `INSERT OR REPLACE INTO ai_insights 
           (id, organization_id, type, title, description, severity, confidence, source, department, team, employee_id, created_at, expires_at, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            insight.id,
            insight.organizationId,
            insight.type,
            insight.title,
            insight.description,
            insight.severity,
            insight.confidence,
            insight.source,
            insight.department || null,
            insight.team || null,
            insight.employeeId || null,
            insight.createdAt,
            insight.expiresAt || null,
            insight.status
          ]
        );

        // Broadcast to HR and Admin rooms
        emitToRole('HR', SOCKET_EVENTS.AI_INSIGHT_GENERATED, insight);
        emitToRole('ADMIN', SOCKET_EVENTS.AI_INSIGHT_GENERATED, insight);

        if (insight.severity === 'HIGH' || insight.severity === 'CRITICAL') {
          emitToRole('HR', SOCKET_EVENTS.AI_ALERT_GENERATED, insight);
          emitToRole('ADMIN', SOCKET_EVENTS.AI_ALERT_GENERATED, insight);
        }

        if (insight.department) {
          emitToDept(insight.department, SOCKET_EVENTS.AI_INSIGHT_GENERATED, insight);
        }
      }

      logger.info('ai_service.analysis_complete', `AI analysis generated ${generatedInsights.length} insights.`);
      return generatedInsights;
    } catch (err: any) {
      logger.error('ai_service.error', `Workforce AI analysis failed: ${err.message}`);
      return [];
    }
  }

  /**
   * Retrieves active insights with RBAC filtering.
   */
  async getActiveInsights(orgId: string, userRole: string, userDept?: string): Promise<AIInsight[]> {
    let sql = `SELECT * FROM ai_insights WHERE organization_id = ? AND status = 'ACTIVE'`;
    const params: any[] = [orgId];

    // RBAC: Employees cannot see organization-wide executive AI insights
    if (userRole === 'EMPLOYEE') {
      sql += ` AND type = 'PREDICTION' AND severity = 'INFO'`;
    } else if (userRole === 'MANAGER' && userDept) {
      sql += ` AND (department = ? OR department IS NULL)`;
      params.push(userDept);
    } else if (userRole === 'TEAM_LEAD') {
      sql += ` AND severity IN ('INFO', 'LOW', 'MEDIUM')`;
    }

    sql += ` ORDER BY created_at DESC LIMIT 20`;

    const rows = await query<any>(sql, params);
    return rows.map((r: any) => ({
      id: r.id,
      organizationId: r.organization_id,
      type: r.type,
      title: r.title,
      description: r.description,
      severity: r.severity,
      confidence: r.confidence,
      source: r.source,
      department: r.department,
      team: r.team,
      employeeId: r.employee_id,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      status: r.status
    }));
  }
}

export const aiService = new AIService();
