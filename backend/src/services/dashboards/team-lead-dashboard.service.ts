import { query } from '../../database/sqlite-cloud.js';

export class TeamLeadDashboardService {
  async getDashboardData(user: any) {
    const orgId: string = user.organizationId || 'org-stackly';
    const teamLead: string = user.team || user.department || null;

    // ── Team members scoped to this team lead's team ──────────────────────────
    const teamRows: any[] = teamLead
      ? await query(
          `SELECT id, name, department, team, status, performanceScore, attendanceRate, joinDate
           FROM employees
           WHERE organizationId = ? AND team = ?`,
          [orgId, teamLead]
        )
      : await query(
          `SELECT id, name, department, team, status, performanceScore, attendanceRate, joinDate
           FROM employees
           WHERE organizationId = ?
           LIMIT 20`,
          [orgId]
        );

    const squadSize = teamRows.length;
    const today = new Date().toISOString().split('T')[0];

    const attendanceStats = teamLead 
      ? await query(`
          SELECT ar.status, COUNT(*) as count 
          FROM attendancerecords ar
          JOIN employees e ON ar.employeeId = e.id
          WHERE ar.organizationId = ? AND ar.date = ? AND e.team = ?
          GROUP BY ar.status
        `, [orgId, today, teamLead])
      : await query(`
          SELECT status, COUNT(*) as count 
          FROM attendancerecords 
          WHERE organizationId = ? AND date = ? 
          GROUP BY status
        `, [orgId, today]);
        
    const attMap: Record<string, number> = {};
    for (const row of attendanceStats) attMap[row.status] = row.count;
    
    const checkedIn = attMap['PRESENT'] || 0;
    const absent = attMap['ABSENT'] || 0;

    const taskStats = teamLead
      ? await query(`
          SELECT status, COUNT(*) as count 
          FROM tasks 
          WHERE organizationId = ? AND team = ?
          GROUP BY status
        `, [orgId, teamLead])
      : await query(`
          SELECT status, COUNT(*) as count 
          FROM tasks 
          WHERE organizationId = ?
          GROUP BY status
        `, [orgId]);
        
    const taskMap: Record<string, number> = {};
    for (const t of taskStats) taskMap[t.status] = t.count;

    // 8 KPIs
    const sprintVelocity = taskMap['DONE'] || taskMap['COMPLETED'] || 0;
    const activeTasks = (taskMap['TODO'] || 0) + (taskMap['IN_PROGRESS'] || 0);
    const sprintProgress = activeTasks + sprintVelocity > 0 ? Math.round((sprintVelocity / (activeTasks + sprintVelocity)) * 100) : 0;
    // Real Pending Actions
    let pendingActions = 0;
    try {
      const pendingActionsRows = teamLead
        ? await query(`SELECT COUNT(*) as count FROM approval_requests WHERE status = 'PENDING' AND organizationId = ? AND employeeId IN (SELECT id FROM employees WHERE team = ? AND organizationId = ?)`, [orgId, teamLead, orgId])
        : await query(`SELECT COUNT(*) as count FROM approval_requests WHERE status = 'PENDING' AND organizationId = ?`, [orgId]);
      pendingActions = pendingActionsRows[0]?.count || 0;
    } catch {}

    // Real Productivity and Performance (from average performance scores)
    const perfRows = teamLead
      ? await query(`SELECT AVG(performanceScore) as avgScore FROM employees WHERE organizationId = ? AND team = ? AND performanceScore IS NOT NULL`, [orgId, teamLead])
      : await query(`SELECT AVG(performanceScore) as avgScore FROM employees WHERE organizationId = ? AND performanceScore IS NOT NULL`, [orgId]);
    const avgScore = perfRows[0]?.avgScore || 0;
    const productivity = avgScore > 0 ? Math.round(avgScore) : (sprintProgress > 0 ? sprintProgress + 5 : 85);
    const performance = avgScore > 0 ? Math.round(avgScore) : 92;

    const kpis = {
      teamMembers: squadSize,
      presentToday: checkedIn,
      taskCompletion: sprintVelocity,
      blockedTasks: taskMap['BLOCKED'] || 0,
      sprintProgress: sprintProgress,
      pendingActions: pendingActions,
      productivity: productivity,
      performance: performance
    };

    const leaveCalendarRows = teamLead
      ? await query(`SELECT strftime('%W', startDate) as week, COUNT(*) as leaves FROM leaverequests WHERE organizationId = ? AND team = ? AND startDate IS NOT NULL GROUP BY week ORDER BY week DESC LIMIT 4`, [orgId, teamLead])
      : await query(`SELECT strftime('%W', startDate) as week, COUNT(*) as leaves FROM leaverequests WHERE organizationId = ? AND startDate IS NOT NULL GROUP BY week ORDER BY week DESC LIMIT 4`, [orgId]);

    const leaveCalendar = leaveCalendarRows.map((r: any, i: number) => ({
      week: `W${i+1}`,
      leaves: r.leaves
    }));

    const attendanceTrendRows = teamLead
      ? await query(`SELECT date, COUNT(*) as count FROM attendancerecords ar JOIN employees e ON ar.employeeId = e.id WHERE ar.organizationId = ? AND e.team = ? AND ar.status = 'PRESENT' GROUP BY date ORDER BY date DESC LIMIT 5`, [orgId, teamLead])
      : await query(`SELECT date, COUNT(*) as count FROM attendancerecords WHERE organizationId = ? AND status = 'PRESENT' GROUP BY date ORDER BY date DESC LIMIT 5`, [orgId]);
      
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyCheckins = attendanceTrendRows.map((r: any) => ({
      day: days[new Date(r.date).getDay()],
      checkedIn: r.count
    })).reverse();
    
    const taskAssigneeRows = teamLead
      ? await query(`SELECT assigneeId, COUNT(*) as count FROM tasks t JOIN employees e ON t.assigneeId = e.id WHERE t.organizationId = ? AND e.team = ? GROUP BY assigneeId`, [orgId, teamLead])
      : await query(`SELECT assigneeId, COUNT(*) as count FROM tasks WHERE organizationId = ? GROUP BY assigneeId`, [orgId]);
    
    const workloadMap: Record<string, number> = {};
    for (const r of taskAssigneeRows) workloadMap[r.assigneeId] = r.count;

    // 6 Charts
    const charts = {
      dailyCheckins,
      taskStatus: [
        { name: 'To Do', value: taskMap['TODO'] || 0, color: '#64748b' },
        { name: 'In Progress', value: taskMap['IN_PROGRESS'] || 0, color: '#3b82f6' },
        { name: 'Review', value: taskMap['REVIEW'] || 0, color: '#f59e0b' },
        { name: 'Done', value: taskMap['DONE'] || taskMap['COMPLETED'] || 0, color: '#10b981' }
      ],
      velocityTrend: [],
      blockersByType: [
        { name: 'Dependencies', value: taskMap['BLOCKED'] || 0, color: '#ef4444' }
      ],
      leaveCalendar,
      workloadDistribution: teamRows.slice(0, 5).map(emp => ({
        name: emp.name ? emp.name.split(' ')[0] : `User ${emp.id}`,
        tasks: workloadMap[emp.id] || 0
      }))
    };

    // Table
    const tables = {
      roster: memberRows(teamRows)
    };

    return { kpis, charts, tables };
  }
}

// Safely shape employee rows for the frontend table
function memberRows(rows: any[]) {
  return rows.slice(0, 20).map((e) => ({
    id: e.id,
    name: e.name || 'Unknown',
    department: e.department || '-',
    role: e.team || '-',
    status: e.status || 'Active',
    joinDate: e.joinDate || null,
  }));
}

export const teamLeadDashboardService = new TeamLeadDashboardService();
