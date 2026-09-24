import { adminDashboardService } from './admin-dashboard.service.js';

export const getAdminDashboard = async (req: any, res: any) => {
  try {
    const data = await adminDashboardService.getDashboardData(req.user);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Admin Dashboard Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load Admin dashboard' });
  }
};
