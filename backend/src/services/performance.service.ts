import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

export const performanceService = {

  /** ─── PERFORMANCE CYCLES ────────────────────────── */
  async getCycles(organizationId: string) {
    return query(
      `SELECT * FROM performance_cycles WHERE organizationId = ? ORDER BY startDate DESC`,
      [organizationId]
    );
  },

  async createCycle(organizationId: string, data: { name: string; startDate: string; endDate: string }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO performance_cycles (id, organizationId, name, startDate, endDate, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [id, organizationId, data.name, data.startDate, data.endDate]
    );
    return { id };
  },

  async closeCycle(cycleId: string, organizationId: string) {
    await execute(
      `UPDATE performance_cycles SET status = 'CLOSED' WHERE id = ? AND organizationId = ?`,
      [cycleId, organizationId]
    );
  },

  /** ─── GOALS ─────────────────────────────────────── */
  async getGoals(employeeId: string, cycleId: string) {
    return query(
      `SELECT * FROM goals WHERE employeeId = ? AND performanceCycleId = ? ORDER BY status`,
      [employeeId, cycleId]
    );
  },

  async createGoal(data: {
    employeeId: string;
    performanceCycleId: string;
    title: string;
    description?: string;
  }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO goals (id, employeeId, performanceCycleId, title, description, progress, status)
       VALUES (?, ?, ?, ?, ?, 0, 'IN_PROGRESS')`,
      [id, data.employeeId, data.performanceCycleId, data.title, data.description || null]
    );
    return { id };
  },

  async updateGoalProgress(goalId: string, progress: number) {
    const status = progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    await execute(
      `UPDATE goals SET progress = ?, status = ? WHERE id = ?`,
      [Math.min(100, Math.max(0, progress)), status, goalId]
    );
  },

  /** ─── REVIEWS ────────────────────────────────────── */
  async getReviews(employeeId: string, cycleId: string) {
    return query(
      `SELECT r.*, e.name as reviewerName
       FROM reviews r
       JOIN employees e ON r.reviewerId = e.id
       WHERE r.employeeId = ? AND r.performanceCycleId = ?`,
      [employeeId, cycleId]
    );
  },

  async createReview(data: {
    employeeId: string;
    reviewerId: string;
    performanceCycleId: string;
  }) {
    const id = randomUUID();
    await execute(
      `INSERT INTO reviews (id, employeeId, reviewerId, performanceCycleId, status)
       VALUES (?, ?, ?, ?, 'DRAFT')`,
      [id, data.employeeId, data.reviewerId, data.performanceCycleId]
    );
    return { id };
  },

  async submitReview(reviewId: string, rating: number, feedback: string) {
    const now = new Date().toISOString();
    await execute(
      `UPDATE reviews SET rating = ?, feedback = ?, status = 'SUBMITTED', submittedAt = ? WHERE id = ?`,
      [rating, feedback, now, reviewId]
    );
  },

  /** ─── AGGREGATE ANALYTICS ────────────────────────── */
  async getCycleAnalytics(cycleId: string, organizationId: string) {
    const avgRating = await query(
      `SELECT AVG(r.rating) as avgRating, COUNT(DISTINCT r.employeeId) as reviewCount
       FROM reviews r
       JOIN employees e ON r.employeeId = e.id
       WHERE r.performanceCycleId = ? AND e.organizationId = ? AND r.status = 'SUBMITTED'`,
      [cycleId, organizationId]
    ).then(rows => rows[0]);

    const goalCompletion = await query(
      `SELECT AVG(g.progress) as avgProgress
       FROM goals g
       JOIN employees e ON g.employeeId = e.id
       WHERE g.performanceCycleId = ? AND e.organizationId = ?`,
      [cycleId, organizationId]
    ).then(rows => rows[0]);

    return { avgRating, goalCompletion };
  }
};
