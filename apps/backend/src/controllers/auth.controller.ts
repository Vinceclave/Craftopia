// apps/backend/src/controllers/auth.controller.ts - Updated with mobile Google auth
import { Request, Response } from "express";
import * as authService from '@/services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.code === 'P2002' && err.meta?.target?.includes('username')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
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

const generateTailwindContent = (title: string, message: string, bgGradient: string, textColor: string) => `
  <div class="flex items-center justify-center min-h-screen ${bgGradient}">
    <div class="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
      <h1 class="text-4xl font-extrabold ${textColor} mb-4"2>${title}</h1>
      <p class="text-gray-700 text-lg">${message}</p>
    </div>
  </div>
`;

export const verifyEmail = async (req: Request, res: Response) => {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Invalid token." });
  }

  try {
    await authService.verifyEmailToken(token);

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Token invalid or expired" });
  }
};

// New mobile Google authentication handler
export const googleMobileAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    const result = await authService.authenticateWithGoogleToken(token);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Google mobile auth error:', error);
    return res.status(400).json({ error: error.message || 'Google authentication failed' });
  }
};