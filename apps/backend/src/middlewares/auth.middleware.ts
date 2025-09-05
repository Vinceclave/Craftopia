// 1. Fix apps/backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { sendError } from "../utils/response";

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = verifyAccessToken(token);
    
    if (!payload || typeof payload === 'string') {
      return sendError(res, 'Invalid or expired token', 401);
    }

    // Type assertion since we know the structure from our token generation
    const typedPayload = payload as { userId: number; role?: string };
    
    req.user = { 
      userId: typedPayload.userId, 
      role: typedPayload.role || 'user' 
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return sendError(res, 'Invalid token', 401);
  }
};