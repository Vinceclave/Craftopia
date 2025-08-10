import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface JwtPayload {
    userId: number;
    role: string;
    iat?: number;
    exp?: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided"});

    const token = authHeader.split(" ")[1];
    if(!token) return res.status(401).json({ error: "Malformed authorization header" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token"});
    }
};

export const authorize = (roles: string[]) =>{
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user as JwtPayload | undefined;

        if (!user) return res.status(401).json({ error: "Unauthenticated" });
        if (!roles.includes(user.role)) return res.status(403).json({ error: "Access denied" });

        next();
    } 
}