import { randomUUID } from 'crypto';
import { query, execute } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

export interface CreateRequestParams {
  workflowId: string;
  entityId: string;
  requesterId: string;
}

export interface TakeActionParams {
  requestId: string;
  approverId: string;
  action: 'APPROVED' | 'REJECTED';
  comments?: string;
}

export const workflowService = {
  /**
   * Initializes a new approval request for an entity.
   */
  async createRequest(params: CreateRequestParams) {
    const id = randomUUID();
    const now = new Date().toISOString();

    // Check if the workflow's first step is AUTO_APPROVE
    const firstStep = await query(
      `SELECT * FROM approval_steps WHERE workflowId = ? AND stepOrder = 1`,
      [params.workflowId]
    ).then(res => res[0]);

    if (firstStep?.approverType === 'AUTO_APPROVE') {
      await execute(
        `INSERT INTO approval_requests (id, workflowId, entityId, requesterId, status, currentStepOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'APPROVED', 1, ?, ?)`,
        [id, params.workflowId, params.entityId, params.requesterId, now, now]
      );
      await this.finalizeEntity(params.workflowId, params.entityId, 'APPROVED');
      logger.info(`[Workflow] Created and AUTO-APPROVED request ${id} for entity ${params.entityId}`);
      return { id, status: 'APPROVED', currentStepOrder: 1 };
    }

    await execute(
      `INSERT INTO approval_requests (id, workflowId, entityId, requesterId, status, currentStepOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'PENDING_APPROVAL', 1, ?, ?)`,
      [id, params.workflowId, params.entityId, params.requesterId, now, now]
    );

    logger.info(`[Workflow] Created approval request ${id} for entity ${params.entityId}`);
    return { id, status: 'PENDING_APPROVAL', currentStepOrder: 1 };
  },

  /**
   * Finalize the entity status (Leave, Expense, etc.) when workflow ends
   */
  async finalizeEntity(workflowId: string, entityId: string, finalStatus: string) {
    const workflow = await query(`SELECT entityType FROM approval_workflows WHERE id = ?`, [workflowId]).then(res => res[0]);
    if (!workflow) return;

    if (workflow.entityType === 'EXPENSE') {
      await execute(`UPDATE expense_claims SET status = ? WHERE id = ?`, [finalStatus, entityId]);
    } else if (workflow.entityType === 'LEAVE') {
      await execute(`UPDATE leave_requests SET status = ? WHERE id = ?`, [finalStatus, entityId]);
    } else if (workflow.entityType === 'ATTENDANCE_CORRECTION') {
      await execute(`UPDATE attendance_corrections SET status = ? WHERE id = ?`, [finalStatus, entityId]);
    }
  },

  /**
   * Process an approval or rejection step.
   */
  async takeAction(params: TakeActionParams) {
    const { requestId, approverId, action, comments } = params;
    const now = new Date().toISOString();

    const request = await query(
      `SELECT r.*, w.entityType 
       FROM approval_requests r
       JOIN approval_workflows w ON r.workflowId = w.id
       WHERE r.id = ?`,
      [requestId]
    ).then(res => res[0]);

    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    if (request.status !== 'PENDING_APPROVAL') {
      throw new Error(`Request is already ${request.status}`);
    }

    // Verify current step
    const currentStep = await query(
      `SELECT * FROM approval_steps 
       WHERE workflowId = ? AND stepOrder = ?`,
      [request.workflowId, request.currentStepOrder]
    ).then(res => res[0]);

    if (!currentStep) {
      throw new Error(`Workflow configuration error: Step ${request.currentStepOrder} not found`);
    }

    // Record the action
    const actionId = randomUUID();
    await execute(
      `INSERT INTO approval_actions (id, requestId, stepOrder, approverId, action, comments, actionAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [actionId, requestId, request.currentStepOrder, approverId, action, comments || null, now]
    );

    if (action === 'REJECTED') {
      await execute(
        `UPDATE approval_requests SET status = 'REJECTED', updatedAt = ? WHERE id = ?`,
        [now, requestId]
      );
      await this.finalizeEntity(request.workflowId, request.entityId, 'REJECTED');
      logger.info(`[Workflow] Request ${requestId} REJECTED at step ${request.currentStepOrder}`);
      return { status: 'REJECTED' };
    }

    // If APPROVED, check routing logic for PARALLEL vs SEQUENTIAL
    if (currentStep.routingType === 'PARALLEL') {
      // Logic for parallel approvals...
    }

    const nextStep = await query(
      `SELECT * FROM approval_steps WHERE workflowId = ? AND stepOrder > ? ORDER BY stepOrder ASC LIMIT 1`,
      [request.workflowId, request.currentStepOrder]
    ).then(res => res[0]);

    if (nextStep) {
      if (nextStep.approverType === 'AUTO_APPROVE') {
         await execute(
           `INSERT INTO approval_actions (id, requestId, stepOrder, approverId, action, comments, actionAt)
            VALUES (?, ?, ?, 'SYSTEM', 'APPROVED', 'Auto-Approved', ?)`,
           [randomUUID(), requestId, nextStep.stepOrder, now]
         );
         await execute(`UPDATE approval_requests SET status = 'APPROVED', updatedAt = ? WHERE id = ?`, [now, requestId]);
         await this.finalizeEntity(request.workflowId, request.entityId, 'APPROVED');
         return { status: 'APPROVED' };
      }

      await execute(
        `UPDATE approval_requests SET currentStepOrder = ?, updatedAt = ? WHERE id = ?`,
        [nextStep.stepOrder, now, requestId]
      );
      logger.info(`[Workflow] Request ${requestId} moved to step ${nextStep.stepOrder}`);
      return { status: 'PENDING_APPROVAL', currentStepOrder: nextStep.stepOrder };
    } else {
      await execute(
        `UPDATE approval_requests SET status = 'APPROVED', updatedAt = ? WHERE id = ?`,
        [now, requestId]
      );
      await this.finalizeEntity(request.workflowId, request.entityId, 'APPROVED');
      logger.info(`[Workflow] Request ${requestId} fully APPROVED`);
      return { status: 'APPROVED' };
    }
  },

  /**
   * Retrieves pending requests for a specific approver.
   */
  async getPendingRequestsForApprover(approverId: string, role: string) {
    const requests = await query(
      `SELECT r.id, r.entityId, r.requesterId, w.entityType, w.name as workflowName, r.currentStepOrder, r.createdAt,
              COALESCE(e1.name, e2.name, e3.name) as employeeName,
              req.managerId,
              CASE
                WHEN w.entityType = 'EXPENSE' THEN 'Expense Claim: ₹' || ex.amount || ' - ' || ex.category
                WHEN w.entityType = 'LEAVE' THEN 'Leave: ' || l.type || ' (' || l.startDate || ' to ' || l.endDate || ')'
                WHEN w.entityType = 'ATTENDANCE_CORRECTION' THEN 'Correction: ' || ac.date
              END as details,
              CASE
                WHEN w.entityType = 'EXPENSE' THEN ex.description
                WHEN w.entityType = 'LEAVE' THEN l.reason
                WHEN w.entityType = 'ATTENDANCE_CORRECTION' THEN ac.reason
              END as description
       FROM approval_requests r
       JOIN employees req ON r.requesterId = req.id
       JOIN approval_workflows w ON r.workflowId = w.id
       JOIN approval_steps s ON r.workflowId = s.workflowId AND r.currentStepOrder = s.stepOrder
       LEFT JOIN expense_claims ex ON w.entityType = 'EXPENSE' AND r.entityId = ex.id
       LEFT JOIN leave_requests l ON w.entityType = 'LEAVE' AND r.entityId = l.id
       LEFT JOIN attendance_corrections ac ON w.entityType = 'ATTENDANCE_CORRECTION' AND r.entityId = ac.id
       LEFT JOIN employees e1 ON ex.employeeId = e1.id
       LEFT JOIN employees e2 ON l.employeeId = e2.id
       LEFT JOIN employees e3 ON ac.employeeId = e3.id
       WHERE r.status = 'PENDING_APPROVAL' 
         AND (
           (s.approverType = 'SPECIFIC_USER' AND s.specificApproverId = ?) OR 
           (s.approverType = 'ROLE' AND s.approverRole = ?) OR
           (s.approverType = 'RELATIONSHIP' AND s.approverRelationship = 'DIRECT_MANAGER' AND req.managerId = ?)
         )`,
      [approverId, role, approverId]
    );
    return requests;
  },

  /**
   * Seed default workflows.
   */
  async seedWorkflows() {
    const existing = await query(`SELECT COUNT(*) as count FROM approval_workflows`).then(res => res[0].count);
    if (existing > 0) return;

    const expenseWfId = randomUUID();
    const leaveWfId = randomUUID();
    const corrWfId = randomUUID();

    await execute(`INSERT INTO approval_workflows (id, name, entityType, createdAt) VALUES 
      (?, 'Standard Expense Approval', 'EXPENSE', datetime('now')),
      (?, 'Standard Leave Approval', 'LEAVE', datetime('now')),
      (?, 'Standard Attendance Correction', 'ATTENDANCE_CORRECTION', datetime('now'))
    `, [expenseWfId, leaveWfId, corrWfId]);

    await execute(`INSERT INTO approval_steps (id, workflowId, stepOrder, approverType, approverRole, approverRelationship) VALUES 
      (?, ?, 1, 'RELATIONSHIP', NULL, 'DIRECT_MANAGER'),
      (?, ?, 1, 'RELATIONSHIP', NULL, 'DIRECT_MANAGER'),
      (?, ?, 1, 'RELATIONSHIP', NULL, 'DIRECT_MANAGER')
    `, [randomUUID(), expenseWfId, randomUUID(), leaveWfId, randomUUID(), corrWfId]);

    logger.info(`[Workflow] Seeded advanced workflows with RELATIONSHIP-based routing`);
  }
};
