import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/token";

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];   

  if (!token) return res.status(401).json({
    success: false,
    errror: 'No token provided'
  });

  const payload = verifyAccessToken(token);

  if(!payload) return res.status(403).json({
    success: false,
    error: 'Invalid or expired token'
  });

  next();
};
