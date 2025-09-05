import { Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from './auth.middleware';
import { sendError } from '../utils/response';

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Forbidden - insufficient permissions', 403);
    }
    
    next();
  };
};

export const requireAuth = authMiddleware;
export const requireAdmin = [authMiddleware, requireRole(['admin'])];
export const requireUser = [authMiddleware, requireRole(['user', 'admin'])];