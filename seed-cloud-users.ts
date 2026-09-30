import { Database } from '@sqlitecloud/drivers';

async function run() {
  const db = new Database('sqlitecloud://chrk2ahwvk.g2.sqlite.cloud:8860/auth.sqlitecloud?apikey=xenaeusZqMZhUIfNKX9p9qx8TNRR7Y1XisX4APazqdE');
  const hash = '$2b$10$bV6Bn0GPPdTcaqC0X8AWkuLm/ZwNDpZZzxcxifKgTd8fdBAAhZ9Mu'; // StacklyWFA2026!
  const now = new Date().toISOString();

  const coreUsers = [
    ['usr-admin-01', 'Sarah Connor', 'admin@thestackly.com', hash, 'ADMIN', null, null, null, null, 5, 'ACTIVE', JSON.stringify(['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_MANAGE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_MANAGE', 'PERMISSION_ASSIGN', 'EMPLOYEE_VIEW_ALL', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'REPORT_VIEW_ALL', 'REPORT_EXPORT', 'SYSTEM_SETTINGS_MANAGE', 'SYSTEM_CONFIG', 'AUDIT_LOG_VIEW', 'VIEW_ALL_DATA']), 1, 'org-stackly', 'org-stackly', now, now],
    ['usr-hr-01', 'Elena Rostova', 'hr@thestackly.com', hash, 'HR', null, null, null, null, 4, 'ACTIVE', JSON.stringify(['EMPLOYEE_VIEW', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_PROFILE_MANAGE', 'ATTENDANCE_VIEW_ALL', 'ATTENDANCE_MANAGE', 'LEAVE_APPROVE', 'PERFORMANCE_MANAGE', 'RECRUITMENT_MANAGE', 'REPORT_GENERATE', 'EMPLOYEE_MANAGE', 'REPORT_VIEW', 'TEAM_ANALYTICS_VIEW']), 1, 'org-stackly', 'org-stackly', now, now],
    ['usr-mgr-01', 'David Sterling', 'manager@thestackly.com', hash, 'MANAGER', 'Engineering', null, null, null, 3, 'ACTIVE', JSON.stringify(['TEAM_VIEW', 'TEAM_ANALYTICS_VIEW', 'EMPLOYEE_VIEW_TEAM', 'ATTENDANCE_VIEW_TEAM', 'LEAVE_APPROVE', 'PERFORMANCE_REVIEW', 'TASK_ASSIGN', 'REPORT_VIEW_TEAM']), 1, 'org-stackly', 'org-stackly', now, now],
    ['usr-lead-01', 'Marcus Vance', 'lead@thestackly.com', hash, 'TEAM_LEAD', 'Engineering', 'Frontend Team', null, null, 2, 'ACTIVE', JSON.stringify(['TEAM_MEMBER_VIEW', 'TEAM_VIEW', 'TASK_ASSIGN', 'TASK_TRACK', 'ATTENDANCE_VIEW_TEAM', 'PRODUCTIVITY_VIEW', 'FEEDBACK_CREATE', 'PERFORMANCE_FEEDBACK']), 1, 'org-stackly', 'org-stackly', now, now],
    ['usr-lead-02', 'Marcus Vance', 'teamlead@thestackly.com', hash, 'TEAM_LEAD', 'Engineering', 'Frontend Team', null, null, 2, 'ACTIVE', JSON.stringify(['TEAM_MEMBER_VIEW', 'TEAM_VIEW', 'TASK_ASSIGN', 'TASK_TRACK', 'ATTENDANCE_VIEW_TEAM', 'PRODUCTIVITY_VIEW', 'FEEDBACK_CREATE', 'PERFORMANCE_FEEDBACK']), 1, 'org-stackly', 'org-stackly', now, now],
    ['usr-exec-01', 'Rachel Zane', 'executive@thestackly.com', hash, 'EXECUTIVE', null, null, null, null, 5, 'ACTIVE', JSON.stringify(['REPORT_VIEW_ALL', 'DASHBOARD_VIEW_ALL', 'EMPLOYEE_VIEW_ALL', 'PERFORMANCE_VIEW_ALL']), 1, 'org-stackly', 'org-stackly', now, now],
    ['usr-emp-01', 'Alex Mercer', 'employee@thestackly.com', hash, 'EMPLOYEE', 'Engineering', 'Frontend Team', 'Bengaluru', 'Full Stack Developer', 1, 'ACTIVE', JSON.stringify(['PROFILE_VIEW', 'PROFILE_UPDATE', 'ATTENDANCE_VIEW_SELF', 'LEAVE_REQUEST', 'PERFORMANCE_VIEW_SELF', 'GOAL_UPDATE', 'DOCUMENT_UPLOAD']), 1, 'org-stackly', 'org-stackly', now, now]
  ];

  for (const u of coreUsers) {
    await db.sql`
      INSERT OR REPLACE INTO users (id, name, email, password_hash, role, department, team, location, title, clearanceLevel, status, permissions, mfa_enabled, organizationId, companyId, createdAt, updatedAt)
      VALUES (${u[0]}, ${u[1]}, ${u[2]}, ${u[3]}, ${u[4]}, ${u[5]}, ${u[6]}, ${u[7]}, ${u[8]}, ${u[9]}, ${u[10]}, ${u[11]}, ${u[12]}, ${u[13]}, ${u[14]}, ${u[15]}, ${u[16]})
    `;
    console.log('Inserted/Updated:', u[2]);
  }
}

run().catch(console.error);
