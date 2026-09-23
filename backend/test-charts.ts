import { adminDashboardService } from './src/services/dashboards/admin-dashboard.service.js';
import { hrDashboardService } from './src/services/dashboards/hr-dashboard.service.js';
import { managerDashboardService } from './src/services/dashboards/manager-dashboard.service.js';
import { teamLeadDashboardService } from './src/services/dashboards/team-lead-dashboard.service.js';
import { employeeDashboardService } from './src/services/dashboards/employee-dashboard.service.js';
import { connectDatabase } from './src/database/sqlite-cloud.js';

async function testCharts() {
  await connectDatabase();
  console.log('--- DB CONNECTED ---');

  const orgId = 'org-stackly';
  const mockUser = { organizationId: orgId, id: 'test-id', team: 'Engineering', department: 'Engineering' };

  console.log('\n=== ADMIN CHARTS ===');
  const adminData = await adminDashboardService.getDashboardData(mockUser);
  console.log(JSON.stringify(adminData.charts, null, 2).slice(0, 500) + '... (truncated)');

  console.log('\n=== HR CHARTS ===');
  const hrData = await hrDashboardService.getDashboardData(mockUser);
  console.log(JSON.stringify(hrData.charts, null, 2).slice(0, 500) + '... (truncated)');

  console.log('\n=== MANAGER CHARTS ===');
  const managerData = await managerDashboardService.getDashboardData(mockUser);
  console.log(JSON.stringify(managerData.charts, null, 2).slice(0, 500) + '... (truncated)');

  console.log('\n=== TEAM LEAD CHARTS ===');
  const teamLeadData = await teamLeadDashboardService.getDashboardData(mockUser);
  console.log(JSON.stringify(teamLeadData.charts, null, 2).slice(0, 500) + '... (truncated)');

  console.log('\n=== EMPLOYEE CHARTS ===');
  // Need a valid employee ID to get tasks, etc. Let's just use a seeded one if possible, or fallback
  const dbUser = { organizationId: orgId, id: adminData.tables.roster[0]?.id || 'test', team: 'Engineering', department: 'Engineering' };
  const empData = await employeeDashboardService.getDashboardData(dbUser);
  console.log(JSON.stringify(empData.charts, null, 2).slice(0, 500) + '... (truncated)');

  console.log('\n=== DONE ===');
}

testCharts().catch(console.error);
