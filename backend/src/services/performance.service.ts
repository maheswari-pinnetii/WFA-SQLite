import { query, execute } from '../database/sqlite-cloud.js';
import { randomUUID } from 'crypto';

export class PerformanceService {
  async getCycles(organizationId: string = 'org-stackly') {
    return query(`SELECT * FROM performance_cycles WHERE organizationId = ? ORDER BY startDate DESC`, [organizationId]);
  }

  async createCycle(organizationId: string, data: { name: string; startDate: string; endDate: string }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO performance_cycles (id, name, startDate, endDate, status, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, ?)`,
      [id, data.name, data.startDate, data.endDate, organizationId, now, now]
    );
    return { id, ...data, status: 'ACTIVE' };
  }

  async getGoals(employeeId: string, cycleId: string) {
    return query(`SELECT * FROM goals WHERE employeeId = ? AND performanceCycleId = ? ORDER BY createdAt DESC`, [employeeId, cycleId]);
  }

  async createGoal(data: { employeeId: string; performanceCycleId: string; title: string; description?: string }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO goals (id, employeeId, performanceCycleId, title, description, progress, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 0, 'IN_PROGRESS', ?, ?)`,
      [id, data.employeeId, data.performanceCycleId, data.title, data.description || '', now, now]
    );
    return { id, ...data, progress: 0, status: 'IN_PROGRESS' };
  }

  async updateGoalProgress(goalId: string, progress: number) {
    const now = new Date().toISOString();
    const status = progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    await execute(`UPDATE goals SET progress = ?, status = ?, updatedAt = ? WHERE id = ?`, [progress, status, now, goalId]);
    return { success: true };
  }

  async getReviews(employeeId: string, cycleId: string) {
    return query(`SELECT * FROM performance_reviews WHERE employeeId = ? AND performanceCycleId = ?`, [employeeId, cycleId]);
  }

  async submitReview(reviewId: string, rating: number, feedback: string) {
    const now = new Date().toISOString();
    await execute(`UPDATE performance_reviews SET rating = ?, feedback = ?, status = 'COMPLETED', updatedAt = ? WHERE id = ?`, [rating, feedback, now, reviewId]);
    return { success: true };
  }

  async getCycleAnalytics(cycleId: string, organizationId: string = 'org-stackly') {
    const totalGoals = await query(`SELECT COUNT(*) as count FROM goals WHERE performanceCycleId = ?`, [cycleId]).then(r => r[0]?.count || 0);
    const completedGoals = await query(`SELECT COUNT(*) as count FROM goals WHERE performanceCycleId = ? AND status = 'COMPLETED'`, [cycleId]).then(r => r[0]?.count || 0);
    const reviews = await query(`SELECT AVG(rating) as avgRating FROM performance_reviews WHERE performanceCycleId = ?`, [cycleId]).then(r => r[0]?.avgRating || 0);
    return {
      cycleId,
      totalGoals,
      completedGoals,
      completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      averageRating: Math.round((reviews || 0) * 10) / 10
    };
  }

  static async getObjectives(employeeId?: string, organizationId: string = 'org-stackly') {
    let sql = `SELECT o.*, e.name as employeeName FROM okr_objectives o JOIN employees e ON o.employeeId = e.id WHERE o.organizationId = ?`;
    const params: any[] = [organizationId];

    if (employeeId) {
      sql += ` AND o.employeeId = ?`;
      params.push(employeeId);
    }
    sql += ` ORDER BY o.createdAt DESC`;

    const objectives = await query(sql, params);
    for (const obj of objectives) {
      obj.keyResults = await query(`SELECT * FROM okr_key_results WHERE objectiveId = ?`, [obj.id]);
    }
    return objectives;
  }

  static async createObjective(data: { employeeId: string; title: string; description?: string; category?: string; quarter?: string; year?: number; organizationId?: string }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO okr_objectives (id, employeeId, title, description, category, quarter, year, progress, status, organizationId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'IN_PROGRESS', ?, ?, ?)`,
      [id, data.employeeId, data.title, data.description || '', data.category || 'INDIVIDUAL', data.quarter || 'Q1', data.year || 2026, data.organizationId || 'org-stackly', now, now]
    );
    return { id, ...data };
  }

  static async addKeyResult(data: { objectiveId: string; title: string; targetValue: number; unit?: string; weight?: number }) {
    const id = randomUUID();
    const now = new Date().toISOString();
    await execute(
      `INSERT INTO okr_key_results (id, objectiveId, title, targetValue, currentValue, unit, weight, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?)`,
      [id, data.objectiveId, data.title, data.targetValue, data.unit || '%', data.weight || 1.0, now, now]
    );
    await this.recalculateObjectiveProgress(data.objectiveId);
    return { id, ...data };
  }

  static async updateKeyResultProgress(keyResultId: string, currentValue: number) {
    const now = new Date().toISOString();
    await execute(`UPDATE okr_key_results SET currentValue = ?, updatedAt = ? WHERE id = ?`, [currentValue, now, keyResultId]);
    
    const kr = await query(`SELECT objectiveId FROM okr_key_results WHERE id = ?`, [keyResultId]).then(res => res[0]);
    if (kr) {
      await this.recalculateObjectiveProgress(kr.objectiveId);
    }
  }

  static async recalculateObjectiveProgress(objectiveId: string) {
    const keyResults = await query(`SELECT * FROM okr_key_results WHERE objectiveId = ?`, [objectiveId]);
    if (keyResults.length === 0) return;

    let totalWeight = 0;
    let weightedProgress = 0;

    for (const kr of keyResults) {
      const progress = Math.min(100, Math.max(0, (kr.currentValue / kr.targetValue) * 100));
      const w = kr.weight || 1.0;
      weightedProgress += progress * w;
      totalWeight += w;
    }

    const finalProgress = totalWeight > 0 ? Number((weightedProgress / totalWeight).toFixed(2)) : 0;
    const status = finalProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    const now = new Date().toISOString();

    await execute(`UPDATE okr_objectives SET progress = ?, status = ?, updatedAt = ? WHERE id = ?`, [finalProgress, status, now, objectiveId]);
  }
}

export const performanceService = new PerformanceService();
