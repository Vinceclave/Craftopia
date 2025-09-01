import { Request, Response } from "express";
import * as authService from '@/services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    return res.status(201).json(result);
  } catch (err: any) {
    // Prisma unique constraint error
    if (err.code === 'P2002' && err.meta?.target?.includes('username')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // fallback for other errors
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid token" });
    }

    const result = await authService.verifyEmailToken(token);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
