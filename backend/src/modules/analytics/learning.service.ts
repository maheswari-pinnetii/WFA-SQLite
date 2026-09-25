import { query } from '../../database/sqlite-cloud.js';

export class LearningAnalyticsService {
  async getLearningDashboard(user: any, filters?: any) {
    const orgId = user.organizationId || 'org-stackly';
    
    // Fetch training enrollments
    const enrollments = await query(
      `SELECT * FROM training_enrollments WHERE organizationId = ?`,
      [orgId]
    );

    const totalEnrollments = enrollments.length;
    const completedTraining = enrollments.filter((e: any) => e.status === 'COMPLETED').length;
    const inProgress = enrollments.filter((e: any) => e.status === 'IN_PROGRESS').length;
    const completionRate = totalEnrollments > 0 ? Math.round((completedTraining / totalEnrollments) * 100) : 0;
    
    const totalHours = enrollments.reduce((sum: number, e: any) => sum + (e.trainingHours || 0), 0);
    const avgScore = enrollments.reduce((sum: number, e: any) => sum + (e.score || 0), 0) / (completedTraining || 1);

    // Fetch Certifications
    const certs = await query(
      `SELECT * FROM certifications WHERE organizationId = ?`,
      [orgId]
    );
    const activeCertifications = certs.filter((c: any) => c.status === 'ACTIVE').length;

    const kpis = {
      totalEnrollments,
      completionRate,
      activeCertifications,
      avgAssessmentScore: Math.round(avgScore),
      totalTrainingHours: Math.round(totalHours),
      inProgressCourses: inProgress,
    };

    // Completion by Department
    const deptMap: Record<string, { enrolled: number, completed: number }> = {};
    enrollments.forEach((e: any) => {
      const dept = e.department || 'Unknown';
      if (!deptMap[dept]) deptMap[dept] = { enrolled: 0, completed: 0 };
      deptMap[dept].enrolled++;
      if (e.status === 'COMPLETED') deptMap[dept].completed++;
    });

    const completionByDept = Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      rate: data.enrolled > 0 ? Math.round((data.completed / data.enrolled) * 100) : 0,
      enrolled: data.enrolled
    }));

    // Top Courses
    const courseMap: Record<string, number> = {};
    enrollments.forEach((e: any) => {
      const course = e.courseName || 'Unknown';
      courseMap[course] = (courseMap[course] || 0) + 1;
    });

    const topCourses = Object.entries(courseMap)
      .map(([name, participants]) => ({ name, participants }))
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5);

    // Course Status Distribution
    const statusMap: Record<string, number> = {};
    enrollments.forEach((e: any) => {
      const status = e.status || 'UNKNOWN';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    const courseStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    return { kpis, completionByDept, topCourses, courseStatus };
  }
}

export const learningAnalyticsService = new LearningAnalyticsService();
