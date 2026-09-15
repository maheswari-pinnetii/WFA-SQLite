import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode, sendError } from '../utils/apiError.js';

export const authorizePermissions = (requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      sendError(res, new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Authentication required.', 401));
      return;
    }

    const userPermissions = typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions || '[]') 
      : (user.permissions || []);
      
    const hasPermission = requiredPermissions.every((perm) => userPermissions.includes(perm));
    
    if (!hasPermission && user.role !== 'ADMIN') {
      sendError(res, AppError.forbidden(ErrorCode.AUTH_PERMISSION_DENIED));
      return;
    }
    next();
  };
};

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      sendError(res, new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Authentication required.', 401));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      sendError(res, AppError.forbidden(ErrorCode.AUTH_PERMISSION_DENIED));
      return;
    }
    next();
  };
};
