// apps/backend/src/middleware/admin.middleware.ts
import { Request, Response, NextFunction } from 'express';

// Middleware to check if user has admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }

  next();
};

// Middleware to check if user is accessing their own data or is admin
export const requireOwnershipOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const targetUserId = parseInt(req.params.userId || req.params.id);
  
  // Allow if user is admin or accessing their own data
  if (req.user.role === 'ADMIN' || req.user.id === targetUserId) {
    next();
  } else {
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'You can only access your own data'
    });
  }
};