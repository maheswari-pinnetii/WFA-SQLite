import { employeeDashboardService } from '../services/dashboards/employee-dashboard.service.js';

export const getEmployeeDashboard = async (req: any, res: any) => {
  try {
    const data = await employeeDashboardService.getDashboardData(req.user);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Employee Dashboard Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load Employee dashboard' });
  }
};
