/**
 * Tenant Scope Middleware
 *
 * Ensures every authenticated request carries a valid organizationId.
 * Must be applied AFTER authenticateToken on all business routes.
 *
 * Rejects with 403 AUTH_TENANT_MISSING if the JWT payload has no organizationId.
 * This prevents a hard-coded 'org-stackly' fallback from silently passing data
 * between different companies.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, sendError } from '../utils/apiError.js';

export const tenantScope = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user) {
    sendError(res, new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Authentication required.', 401));
    return;
  }

  // Normalize: support both organizationId and companyId in the JWT payload
  const orgId: string | undefined =
    user.organizationId || user.companyId || user.org_id;

  if (!orgId || typeof orgId !== 'string' || orgId.trim() === '') {
    sendError(
      res,
      new AppError(
        ErrorCode.AUTH_TENANT_MISSING,
        'Your account is not associated with an organization. Please contact your administrator.',
        403
      )
    );
    return;
  }

  // Normalize onto a single field so services don't need to check both
  user.organizationId = orgId.trim();
  user.companyId      = orgId.trim();   // keep legacy alias in sync

  next();
};

/**
 * Ownership guard factory.
 *
 * Verifies that the resource ID in `req.params[paramName]` belongs to the
 * authenticated user's organization by running a lightweight DB query.
 *
 * Usage:
 *   router.get('/employees/:id', authenticateToken, tenantScope,
 *              ownershipGuard('employees', 'id'), handler);
 */
import { query } from '../database/sqlite-cloud.js';
import { logger } from '../config/logger.js';

export const ownershipGuard = (table: string, paramName = 'id', orgField = 'organizationId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const resourceId = req.params[paramName];
    const user       = (req as any).user;
    const orgId      = user?.organizationId;

    // ADMINs and HR users can access across employees within the same org
    const role = user?.role;
    if (role === 'ADMIN' || role === 'HR') {
      return next();
    }

    if (!resourceId || !orgId) {
      sendError(res, AppError.forbidden());
      return;
    }

    try {
      const rows = await query(
        `SELECT id FROM ${table} WHERE id = ? AND ${orgField} = ? LIMIT 1`,
        [resourceId, orgId]
      );

      if (!rows || rows.length === 0) {
        // Either doesn't exist or belongs to a different tenant — return same 404 to avoid enumeration
        sendError(res, AppError.notFound('Resource'));
        return;
      }

      next();
    } catch (err) {
      logger.error('middleware.ownershipGuard.error', `Failed ownership check on table ${table}`, { resourceId, orgId });
      sendError(res, err);
    }
  };
};
