import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;
        const user = await authService.register(username, email, password);
        res.status(201).json({ success: true, data: user });
    } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ success: false, error: 'Username and password required' });
        const result = await authService.login(username, password);
        res.status(200).json({ success: true, ...result });
    } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
        const result = await authService.refreshTokens(refreshToken);
        res.status(200).json({ success: true, ...result });
    } catch (err) { next(err); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.logout(req.body.refreshToken);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        console.warn('Logout error:', err);
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') return res.status(400).json({ success: false, error: 'Token required' });

        const user = await authService.verifyEmail(token);
        res.status(200).json({ success: true, data: user, message: 'Email verified successfully' });
    } catch (err) {
        next(err);
    }
};

export const requestEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

        const result = await authService.resendVerificationEmail(email);
        res.status(200).json({ success: true, ...result });
    } catch (err: any) {
        next(err);
    }
};