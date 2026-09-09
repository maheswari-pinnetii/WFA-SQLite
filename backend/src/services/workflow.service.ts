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

    await execute(
      `INSERT INTO approval_requests (id, workflowId, entityId, requesterId, status, currentStepOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'PENDING', 1, ?, ?)`,
      [id, params.workflowId, params.entityId, params.requesterId, now, now]
    );

    logger.info(`[Workflow] Created approval request ${id} for entity ${params.entityId}`);
    return { id, status: 'PENDING', currentStepOrder: 1 };
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

    if (request.status !== 'PENDING') {
      throw new Error(`Request is already ${request.status}`);
    }

    // Verify if this is the correct step
    const currentStep = await query(
      `SELECT * FROM approval_steps 
       WHERE workflowId = ? AND stepOrder = ?`,
      [request.workflowId, request.currentStepOrder]
    ).then(res => res[0]);

    if (!currentStep) {
      throw new Error(`Workflow configuration error: Step ${request.currentStepOrder} not found`);
    }

    // Insert action
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
      logger.info(`[Workflow] Request ${requestId} REJECTED at step ${request.currentStepOrder}`);
      return { status: 'REJECTED' };
    }

    // If APPROVED, check if there are more steps
    const nextStep = await query(
      `SELECT * FROM approval_steps WHERE workflowId = ? AND stepOrder > ? ORDER BY stepOrder ASC LIMIT 1`,
      [request.workflowId, request.currentStepOrder]
    ).then(res => res[0]);

    if (nextStep) {
      // Move to next step
      await execute(
        `UPDATE approval_requests SET currentStepOrder = ?, updatedAt = ? WHERE id = ?`,
        [nextStep.stepOrder, now, requestId]
      );
      logger.info(`[Workflow] Request ${requestId} moved to step ${nextStep.stepOrder}`);
      return { status: 'PENDING', currentStepOrder: nextStep.stepOrder };
    } else {
      // Final approval reached
      await execute(
        `UPDATE approval_requests SET status = 'APPROVED', updatedAt = ? WHERE id = ?`,
        [now, requestId]
      );
      logger.info(`[Workflow] Request ${requestId} fully APPROVED`);
      return { status: 'APPROVED' };
    }
  },

  /**
   * Retrieves pending requests for a specific approver.
   * Resolves role-based logic or specific approver logic.
   */
  async getPendingRequestsForApprover(approverId: string, role: string) {
    const requests = await query(
      `SELECT r.id, r.entityId, w.entityType, w.name as workflowName, r.currentStepOrder, r.createdAt
       FROM approval_requests r
       JOIN approval_workflows w ON r.workflowId = w.id
       JOIN approval_steps s ON r.workflowId = s.workflowId AND r.currentStepOrder = s.stepOrder
       WHERE r.status = 'PENDING' 
         AND (s.specificApproverId = ? OR s.approverRole = ?)`,
      [approverId, role]
    );
    return requests;
  }
};
