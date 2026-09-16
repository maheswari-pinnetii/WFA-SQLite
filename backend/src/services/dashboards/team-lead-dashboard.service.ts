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

    const teamSize = teamRows.length;

    // ── Attendance today (scoped to team) ─────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    const attendanceRows: any[] = teamLead
      ? await query(
          `SELECT ar.status, COUNT(*) as count
           FROM attendancerecords ar
           JOIN employees e ON ar.employeeId = e.id
           WHERE ar.organizationId = ? AND ar.date = ? AND e.team = ?
           GROUP BY ar.status`,
          [orgId, today, teamLead]
        )
      : await query(
          `SELECT status, COUNT(*) as count
           FROM attendancerecords
           WHERE organizationId = ? AND date = ?
           GROUP BY status`,
          [orgId, today]
        );

    const attendanceMap: Record<string, number> = {};
    for (const row of attendanceRows) {
      attendanceMap[row.status] = row.count;
    }

    const present = attendanceMap['PRESENT'] || 0;
    const absent = attendanceMap['ABSENT'] || 0;
    const late = attendanceMap['LATE'] || 0;
    const onLeave = attendanceMap['ON_LEAVE'] || 0;

    // ── Leave requests pending for team ────────────────────────────────────────
    const pendingLeaveRows: any[] = teamLead
      ? await query(
          `SELECT COUNT(*) as count
           FROM leaverequests lr
           JOIN employees e ON lr.employeeId = e.id
           WHERE lr.status = 'PENDING' AND lr.organizationId = ? AND e.team = ?`,
          [orgId, teamLead]
        )
      : await query(
          `SELECT COUNT(*) as count
           FROM leaverequests
           WHERE status = 'PENDING' AND organizationId = ?`,
          [orgId]
        );
    const pendingLeave = pendingLeaveRows[0]?.count || 0;

    // ── Attendance weekly trend (last 7 days, scoped to team) ──────────────────
    const weeklyRows: any[] = teamLead
      ? await query(
          `SELECT ar.date, ar.status, COUNT(*) as count
           FROM attendancerecords ar
           JOIN employees e ON ar.employeeId = e.id
           WHERE ar.organizationId = ? AND e.team = ?
             AND ar.date >= date('now', '-6 days')
           GROUP BY ar.date, ar.status
           ORDER BY ar.date ASC`,
          [orgId, teamLead]
        )
      : await query(
          `SELECT date, status, COUNT(*) as count
           FROM attendancerecords
           WHERE organizationId = ? AND date >= date('now', '-6 days')
           GROUP BY date, status
           ORDER BY date ASC`,
          [orgId]
        );

    // Build weekly attendance chart data
    const weeklyMap: Record<string, { date: string; present: number; absent: number; late: number }> = {};
    for (const row of weeklyRows) {
      if (!weeklyMap[row.date]) {
        weeklyMap[row.date] = { date: row.date, present: 0, absent: 0, late: 0 };
      }
      if (row.status === 'PRESENT') weeklyMap[row.date].present = row.count;
      if (row.status === 'ABSENT') weeklyMap[row.date].absent = row.count;
      if (row.status === 'LATE') weeklyMap[row.date].late = row.count;
    }
    const weeklyAttendance = Object.values(weeklyMap).map((d) => ({
      name: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
      present: d.present,
      absent: d.absent,
      late: d.late,
    }));

    // ── Member-level task status aggregation ─────────────────────────────────
    const memberStats = teamRows.slice(0, 10).map((emp) => ({
      name: emp.name || `Employee ${emp.id}`,
      status: emp.status || 'Active',
      performanceScore: emp.performanceScore || 0,
      attendanceRate: emp.attendanceRate || 0,
    }));

    return {
      kpis: {
        teamSize,
        present,
        absent,
        late,
        onLeave,
        pendingLeaveRequests: pendingLeave,
        // Sprint metrics are task-tracker domain — return neutral defaults until task API is integrated
        sprintVelocity: null,
        blockedTasks: null,
        codeReviews: null,
      },
      charts: {
        weeklyAttendance,
        memberStats,
      },
      tables: {
        teamMembers: memberRows(teamRows),
      },
    };
  }
}

// Safely shape employee rows for the frontend table
function memberRows(rows: any[]) {
  return rows.slice(0, 20).map((e) => ({
    id: e.id,
    name: e.name || 'Unknown',
    department: e.department || '-',
    team: e.team || '-',
    status: e.status || 'Active',
    performanceScore: e.performanceScore ?? null,
    attendanceRate: e.attendanceRate ?? null,
    joinDate: e.joinDate || null,
  }));
}

export const teamLeadDashboardService = new TeamLeadDashboardService();
