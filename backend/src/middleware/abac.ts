import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, sendError } from '../utils/apiError.js';
import { query } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

/**
 * Attribute-Based Access Control (ABAC) Guard
 * 
 * Enforces organization structure boundaries:
 * - ADMIN: Can access anything.
 * - HR: Can access anything within their organizationId.
 * - MANAGER: Can only access resources in their specific department (and organization).
 * - TEAM_LEAD: Can only access resources in their specific team (and department & organization).
 * - EMPLOYEE: Can only access their own resources (enforced differently, usually by `id === req.user.id`).
 */
export const abacGuard = (table: string, paramName = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const resourceId = req.params[paramName];
    const user = (req as any).user;

    if (!user) {
      sendError(res, new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Authentication required.', 401));
      return;
    }

    if (!resourceId) {
      sendError(res, AppError.badRequest(ErrorCode.VALIDATION_ERROR, 'Resource ID is required for access check.'));
      return;
    }

    const { role, organizationId, department, team } = user;

    // ADMINs bypass all checks (though tenantScope usually guards orgs)
    if (role === 'ADMIN') {
      return next();
    }

    try {
      // Query the target resource to check its attributes
      const rows = await query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [resourceId]);
      
      if (!rows || rows.length === 0) {
        // Obfuscate existence for unauthorized cross-tenant queries
        sendError(res, AppError.notFound('Resource'));
        return;
      }

      const resource = rows[0];

      // 1. Organization Scope (Highest priority for all non-admin)
      const resourceOrgId = resource.organizationId || resource.companyId || resource.org_id;
      if (resourceOrgId && resourceOrgId !== organizationId) {
        logger.warn('security.abac.violation', `Cross-org access attempt by ${user.id} to ${table}:${resourceId}`);
        sendError(res, AppError.notFound('Resource')); // Return 404 to avoid enumeration
        return;
      }

      // 2. Department Scope (Managers)
      if (role === 'MANAGER') {
        const resourceDept = resource.department;
        if (resourceDept && resourceDept !== department) {
          logger.warn('security.abac.violation', `Cross-department access attempt by Manager ${user.id} to ${table}:${resourceId}`);
          sendError(res, AppError.forbidden(ErrorCode.AUTH_PERMISSION_DENIED));
          return;
        }
      }

      // 3. Team Scope (Team Leads)
      if (role === 'TEAM_LEAD') {
        const resourceTeam = resource.team;
        if (resourceTeam && resourceTeam !== team) {
          logger.warn('security.abac.violation', `Cross-team access attempt by Team Lead ${user.id} to ${table}:${resourceId}`);
          sendError(res, AppError.forbidden(ErrorCode.AUTH_PERMISSION_DENIED));
          return;
        }
      }

      // 4. Employee Scope (Must be exact self-match if the route didn't already catch it)
      if (role === 'EMPLOYEE' && table === 'employees' && resource.id !== user.id) {
        logger.warn('security.abac.violation', `Cross-employee access attempt by Employee ${user.id} to ${table}:${resourceId}`);
        sendError(res, AppError.forbidden(ErrorCode.AUTH_PERMISSION_DENIED));
        return;
      }

      next();
    } catch (err) {
      logger.error('middleware.abacGuard.error', `Failed ABAC check on table ${table}`, { resourceId, userId: user.id });
      sendError(res, err);
    }
  };
};
