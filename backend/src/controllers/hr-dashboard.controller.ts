import { hrDashboardService } from '../services/dashboards/hr-dashboard.service.js';

export const getHrDashboard = async (req: any, res: any) => {
  try {
    const data = await hrDashboardService.getDashboardData(req.user);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('HR Dashboard Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load HR dashboard' });
  }
};
