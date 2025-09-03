import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/jwt';
import { findUserById } from '@/services/user.service';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                email: string;
                role: string; 
            };
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    try {
        const decoded = verifyToken(token);
        const user = await findUserById(decoded.id);

        if (!user) 
            return res.status(401).json({ error: 'user not found'  });

        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        }

       return next();
    } catch (err: any) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

} 