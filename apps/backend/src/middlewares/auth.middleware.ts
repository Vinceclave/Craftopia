// apps/backend/src/middlewares/auth.middleware.ts - ENHANCED VERSION
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { UnauthorizedError } from "../utils/error";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
  user?: { 
    userId: number; 
    role: string 
  };
}

export const authMiddleware = (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists
    if (!authHeader) {
      logger.logSecurityEvent(
        'Missing Authorization Header',
        'low',
        { url: req.url, method: req.method, ip: req.ip }
      );
      throw new UnauthorizedError('No token provided');
    }

    // Check if token is in correct format
    if (!authHeader.startsWith('Bearer ')) {
      logger.logSecurityEvent(
        'Invalid Authorization Format',
        'low',
        { url: req.url, method: req.method, ip: req.ip }
      );
      throw new UnauthorizedError('Invalid authorization format');
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    if (!token.trim()) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const payload = verifyAccessToken(token);

    if (!payload) {
      logger.logSecurityEvent(
        'Invalid Token Attempt',
        'medium',
        { url: req.url, method: req.method, ip: req.ip }
      );
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Attach user to request
    req.user = {
      userId: payload.userId,
      role: payload.role || 'user'
    };

    logger.debug('Auth Middleware: Token verified', {
      userId: payload.userId,
      role: payload.role
    });

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.error('Auth Middleware Error', error);
      next(new UnauthorizedError('Authentication failed'));
    }
  }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without auth
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = verifyAccessToken(token);

    if (payload) {
      req.user = {
        userId: payload.userId,
        role: payload.role || 'user'
      };
    }

    next();
  } catch (error) {
    // Continue without auth on error
    logger.debug('Optional Auth: Token invalid, continuing without auth');
    next();
  }
};