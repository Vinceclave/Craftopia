// apps/backend/src/middlewares/auth.middleware.ts - SIMPLE FIXED VERSION

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
    
    if (!payload) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    req.user = { 
      userId: payload.userId, 
      role: payload.role || 'user' 
    };
    
    next();
  } catch (error) {
    return sendError(res, 'Invalid token', 401);
  }
};