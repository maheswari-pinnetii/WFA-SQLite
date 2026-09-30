import 'dotenv/config';
import { adminDashboardService } from './backend/src/modules/dashboards/admin-dashboard.service.js';
import { connectDatabase } from './backend/src/database/sqlite-cloud.js';

async function test() {
  await connectDatabase();
  const res = await adminDashboardService.getDashboardData({ organizationId: 'org-stackly' }, {});
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
test();
