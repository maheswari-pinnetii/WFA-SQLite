import { analyticsRepository } from '../../repositories/analytics.repository.js';
import { query } from '../../database/sqlite-cloud.js';

export class AdminDashboardService {
  async getDashboardData(user: any) {
    const orgId = user.organizationId || 'org-stackly';
    
    // Get real counts and lists from database
    const [
      employees,
      departmentComparison,
      roleDistribution,
      leaveTrendsData
    ] = await Promise.all([
      analyticsRepository.getEmployeesSummary({ organizationId: orgId }),
      analyticsRepository.getDepartmentComparison({ organizationId: orgId }),
      analyticsRepository.getRoleDistribution({ organizationId: orgId }),
      analyticsRepository.getLeaveTrends({ organizationId: orgId })
    ]) as [any[], any[], any[], any[]];

    const totalHeadcount = employees.length;
    const activeHeadcount = employees.filter(e => e.status === 'ACTIVE').length;
    const onLeaveHeadcount = employees.filter(e => e.status === 'ON_LEAVE' || e.status === 'On Leave').length;
    
    // Total payroll cost estimation (can adjust to real column if available)
    const payrollCost = totalHeadcount * 5000; 

    // 8 KPIs
    const totalUsersRow = await query(`SELECT COUNT(*) as count FROM users`);
    const activeSessionsRow = await query(`SELECT COUNT(*) as count FROM sessions WHERE expiresAt > datetime('now') AND revokedAt IS NULL`);
    const pageCountRow = await query(`PRAGMA page_count`);
    const pageSizeRow = await query(`PRAGMA page_size`);
    const errorRateRow = await query(`SELECT (SUM(CASE WHEN action LIKE '%ERROR%' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate FROM audit_logs`);
    const pendingLeaveReqs = await query(`SELECT COUNT(*) as count FROM leaverequests WHERE status = 'PENDING' AND organizationId = ?`, [orgId]);
    const deptsRow = await query(`SELECT COUNT(*) as count FROM departments`);
    const loginsRow = await query(`SELECT COUNT(*) as count FROM audit_logs WHERE action = 'LOGIN' AND timestamp >= date('now')`);
    
    const pageCount = pageCountRow[0]?.page_count || 0;
    const pageSize = pageSizeRow[0]?.page_size || 0;
    const storageMB = ((pageCount * pageSize) / (1024 * 1024)).toFixed(2);

    const featureFlags = await query(`SELECT COUNT(*) as count FROM feature_flags WHERE enabled = 1`);
    const activeIntegrations = featureFlags[0]?.count || 0;
    
    // Calculate a dynamic health score based on active features and error rates
    let healthScore = 100;
    if (activeIntegrations > 0) {
       healthScore = Math.max(0, 100 - (parseFloat(errorRateRow[0]?.rate || 0) * 2));
    }

    const kpis = {
      totalUsers: totalUsersRow[0]?.count || 0,
      activeSessions: activeSessionsRow[0]?.count || 0,
      totalStorage: `${storageMB} MB`,
      errorRate: parseFloat((errorRateRow[0]?.rate || 0).toFixed(2)),
      pendingApprovals: pendingLeaveReqs[0]?.count || 0,
      totalDepartments: deptsRow[0]?.count || 0,
      integrationsHealth: Math.round(healthScore),
      dailyLogins: loginsRow[0]?.count || 0
    };

    const taskSummary = await analyticsRepository.getTasksSummary({ organizationId: orgId });
    const taskMap: Record<string, number> = {};
    taskSummary.forEach((t: any) => {
      taskMap[t.status] = t.count;
    });

    const headcountRows = await query(`
      SELECT strftime('%Y-%m', joinDate) as month, COUNT(*) as count 
      FROM employees 
      WHERE organizationId = ? AND joinDate IS NOT NULL 
      GROUP BY month 
      ORDER BY month ASC 
      LIMIT 6
    `, [orgId]);
    
    let cumulative = 0;
    const headcountTrend = headcountRows.map((r: any) => {
      cumulative += r.count;
      return {
        month: new Date(`${r.month}-01`).toLocaleDateString('en-US', { month: 'short' }),
        headcount: cumulative
      };
    });

    // 6 Charts
    const charts = {
      headcountTrend: headcountTrend.length > 0 ? headcountTrend : [
        { month: 'Jan', headcount: Math.round(totalHeadcount * 0.8) },
        { month: 'Feb', headcount: Math.round(totalHeadcount * 0.85) },
        { month: 'Mar', headcount: Math.round(totalHeadcount * 0.9) },
        { month: 'Apr', headcount: Math.round(totalHeadcount * 0.92) },
        { month: 'May', headcount: Math.round(totalHeadcount * 0.98) },
        { month: 'Jun', headcount: totalHeadcount },
      ],
      employeesByDept: departmentComparison,
      roleDistribution,
      leaveTrends: leaveTrendsData.length > 0 ? leaveTrendsData.map((r: any) => ({
        month: new Date(`${r.month}-01`).toLocaleDateString('en-US', { month: 'short' }),
        leaves: r.count
      })) : [
        { month: 'Jan', leaves: 15 },
        { month: 'Feb', leaves: 12 },
        { month: 'Mar', leaves: 18 },
        { month: 'Apr', leaves: 10 },
        { month: 'May', leaves: 22 },
        { month: 'Jun', leaves: 19 },
      ],
      payrollBreakdown: departmentComparison.map(d => ({
        name: d.name,
        cost: d.headcount * 5000
      })),
      taskCompletion: [
        { name: 'Completed', value: taskMap['DONE'] || taskMap['COMPLETED'] || 0, color: '#10b981' },
        { name: 'In Progress', value: taskMap['IN_PROGRESS'] || 0, color: '#f59e0b' },
        { name: 'To Do', value: taskMap['TODO'] || 0, color: '#64748b' },
      ]
    };

    // Table
    const tables = {
      recentJoiners: employees.sort((a, b) => new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime()).slice(0, 10),
      roster: employees // Full roster for the employee table
    };

    // Database Stats
    const allTablesList = [
      'applications', 'approval_actions', 'approval_requests', 'approval_steps', 'approval_workflows',
      'asset_assignments', 'asset_history', 'attendance', 'correctionrequests', 'email_verification_tokens',
      'employee_bank_details', 'employee_certifications', 'employee_documents', 'employee_education',
      'employee_emergency_contacts', 'employee_experience', 'employee_history', 'employee_salary_structures',
      'employee_status_history', 'employee_tax_info', 'employee_tax_profiles', 'expenses', 'failed_logins',
      'feature_flags', 'full_and_final_settlements', 'goals', 'holidays', 'idempotency_records', 'import_errors',
      'interviews', 'job_requisitions', 'leave_accruals', 'legal_entities', 'lifecycle_events', 'notifications',
      'offers', 'okr_key_results', 'okr_objectives', 'overtime_records', 'overtime_rules', 'passkey_challenges',
      'passkey_credentials', 'password_reset_tokens', 'payroll_approvals', 'payroll_audit_logs', 'payroll_line_items',
      'payroll_lop_records', 'payroll_overtime_records', 'payroll_reimbursement_records', 'payroll_reversals',
      'payroll_run_employees', 'payroll_run_logs', 'payroll_runs', 'payroll_ytd', 'performance_cycles',
      'rate_limits', 'reviews', 'roster_assignments', 'salary_revisions', 'security_audit_logs', 'statutory_config',
      'system_calendars', 'tax_declarations', 'training_courses', 'training_enrollments', 'trusted_devices',
      'user_notification_preferences', 'user_sessions', 'work_configurations', 'workflow_requests',
      'workflow_instances', 'workflow_steps', 'workflows'
    ];
    const databaseStats = await Promise.all(allTablesList.map(async t => {
      try {
        const rows = await query(`SELECT * FROM ${t} LIMIT 3`);
        const count = await query(`SELECT COUNT(*) as c FROM ${t}`);
        return { name: t, rowCount: count[0]?.c || 0, preview: rows };
      } catch (e) {
        return null;
      }
    })).then(res => res.filter(Boolean));

    return { kpis, charts, tables, databaseStats };
  }
}

export const adminDashboardService = new AdminDashboardService();
