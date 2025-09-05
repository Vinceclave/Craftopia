import { Response, Request, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const roleBaseMiddleware = (roles: 'user' | 'admin') => {
     return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) 
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        
        if (!roles.includes(req.user.role)) 
            return res.status(403).json({ success: false, error: 'Forbidden' });
        next();
     }
}