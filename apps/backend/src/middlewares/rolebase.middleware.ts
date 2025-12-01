// apps/backend/src/middlewares/rolebase.middleware.ts - ENHANCED VERSION
import { Response, NextFunction } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from './auth.middleware';
import { ForbiddenError, UnauthorizedError } from '../utils/error';
import { logger } from '../utils/logger';
import { UserRole } from "@prisma/client";

// Check if user has required role
const checkRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};

// Role requirement middleware factory
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Check if user has required role
      if (!checkRole(req.user.role, allowedRoles)) {
        logger.logSecurityEvent(
          'Insufficient Permissions',
          'medium',
          {
            userId: req.user.userId,
            userRole: req.user.role,
            requiredRoles: allowedRoles,
            url: req.url,
            method: req.method
          }
        );

        throw new ForbiddenError(
          `This action requires one of these roles: ${allowedRoles.join(', ')}`
        );
      }

      logger.debug('Role Check Passed', {
        userId: req.user.userId,
        role: req.user.role,
        allowedRoles
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Pre-configured role middlewares
export const requireAuth = authMiddleware;
export const optionalAuth = optionalAuthMiddleware;

// Admin only
export const requireAdmin = [
  authMiddleware,
  requireRole(UserRole.admin)
];

// User or Admin
export const requireUser = [
  authMiddleware,
  requireRole(UserRole.user, UserRole.admin)
];

// Check if user is admin (for conditional logic in controllers)
export const isAdmin = (req: AuthRequest): boolean => {
  return req.user?.role === UserRole.admin;
};

// Check if user is owner of resource (for conditional logic)
export const isOwner = (req: AuthRequest, resourceUserId: number): boolean => {
  return req.user?.userId === resourceUserId;
};

// Check if user is admin or owner
export const isAdminOrOwner = (req: AuthRequest, resourceUserId: number): boolean => {
  return isAdmin(req) || isOwner(req, resourceUserId);
};