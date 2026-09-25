import { query } from '../../database/sqlite-cloud.js';

export class PlacementAnalyticsService {
  async getPlacementDashboard(user: any, filters?: any) {
    const orgId = user.organizationId || 'org-stackly';
    
    // Fetch placements
    const placements = await query(
      `SELECT * FROM placements WHERE organizationId = ?`,
      [orgId]
    );

    const totalPlacements = placements.length;
    const activePlacements = placements.filter((p: any) => p.status === 'PLACED').length;
    const pendingPlacements = placements.filter((p: any) => p.status === 'PENDING').length;
    
    let totalSalary = 0;
    let placedCount = 0;
    let totalTimeDays = 0;

    const deptMap: Record<string, number> = {};
    const skillMap: Record<string, number> = {};
    const employerMap: Record<string, number> = {};

    placements.forEach((p: any) => {
      if (p.status === 'PLACED') {
        if (p.salary) totalSalary += p.salary;
        if (p.placementTimeDays) totalTimeDays += p.placementTimeDays;
        placedCount++;

        const dept = p.department || 'Unknown';
        deptMap[dept] = (deptMap[dept] || 0) + 1;

        const skill = p.skill || 'Unknown';
        skillMap[skill] = (skillMap[skill] || 0) + 1;

        const employer = p.employer || 'Unknown';
        employerMap[employer] = (employerMap[employer] || 0) + 1;
      }
    });

    const kpis = {
      totalPlacements: activePlacements,
      placementRate: totalPlacements > 0 ? Math.round((activePlacements / totalPlacements) * 100) : 0,
      avgSalary: placedCount > 0 ? Math.round(totalSalary / placedCount) : 0,
      avgTimeToPlace: placedCount > 0 ? Math.round(totalTimeDays / placedCount) : 0,
      activePartners: Object.keys(employerMap).length,
      pendingPlacements,
    };

    const placementByDept = Object.entries(deptMap).map(([dept, count]) => ({
      department: dept,
      placements: count
    })).sort((a, b) => b.placements - a.placements);

    const topSkills = Object.entries(skillMap).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    const topEmployers = Object.entries(employerMap).map(([name, count]) => ({
      name,
      placements: count,
      avgSalary: placedCount > 0 ? Math.round(totalSalary / placedCount) : 0 // Basic approximation for now, or you could do it per employer if you track it
    })).sort((a, b) => b.placements - a.placements).slice(0, 5);

    const placementTrend: any[] = [];
    // Could aggregate by actual month but since we don't have createdAt in the aggregation right now, we can omit it or group properly.
    // For now returning empty array and will rely on frontend or proper DB grouping if needed

    return { kpis, placementByDept, topSkills, placementTrend, topEmployers };
  }
}

export const placementAnalyticsService = new PlacementAnalyticsService();
