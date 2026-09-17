import { query, execute } from '../database/sqlite-cloud.js';
import { randomUUID } from 'crypto';

export class PerformanceService {
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
