import { teamLeadDashboardService } from './team-lead-dashboard.service.js';

export const getTeamLeadDashboard = async (req: any, res: any) => {
  try {
    const data = await teamLeadDashboardService.getDashboardData(req.user);
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Team Lead Dashboard Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load Team Lead dashboard' });
  }
};
