// middlewares/auth.middleware.ts (Updated)
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type AccessTokenPayload } from "../utils/token";
import { sendError } from "../utils/response";

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return sendError(res, 'No token provided', 401);
    }

    const payload: AccessTokenPayload | null = verifyAccessToken(token);
    if (!payload) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    req.user = { 
      userId: payload.userId, 
      role: payload.role || 'user' 
    };
    next();
  } catch (error) {
    sendError(res, 'Invalid token', 401);
  }
};