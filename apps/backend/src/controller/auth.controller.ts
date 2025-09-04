import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth.service';
import { revokeRefreshToken } from "../services/resfreshToken.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;
        const user = await authService.register(username, email, password);
        res.status(201).json({ success: true, data: user });            
    } catch (err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }
        
        const result = await authService.login(username, password);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }
        
        const result = await authService.refreshTokens(refreshToken);
        res.status(200).json({ success: true, ...result });
    } catch (err) {
        next(err);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        
        // Even if no refresh token provided, we still return success
        // This handles cases where client doesn't have a valid token
        if (refreshToken) {
            await revokeRefreshToken(refreshToken);
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully'
        });
    } catch (err) {
        // For logout, we don't want to throw errors even if token is invalid
        // Just log the error and return success
        console.warn('Logout error (non-critical):', err);
        res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully'
        });
    }
}