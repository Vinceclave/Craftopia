import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { Role } from '@prisma/client';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role } = req.body;

        // Only allow admin role creation from admin endpoints if needed.
        // For simplicity, allow role override here (but you might want to restrict)
        const parsedRole: Role = role === "Admin" ? Role.ADMIN : Role.USER;

        const user = await authService.register(username, email, password, parsedRole);
        const { password: _p, ...safeUser} = user as any;
        res.status(201).json(safeUser);
    } catch (error: any) {
        return res.status(400).json({error: error.message || "Registration failed"});
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await authService.login(email, password);
        res.json({token, user});
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Login failed" });
    }
}