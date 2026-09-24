import { managerDashboardService } from './manager-dashboard.service.js';

export const getManagerDashboard = async (req: any, res: any) => {
  try {
    const data = await managerDashboardService.getDashboardData(req.user);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Manager Dashboard Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load Manager dashboard' });
  }
};
