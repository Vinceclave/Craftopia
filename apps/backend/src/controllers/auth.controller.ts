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
    return res.status(400).send(
      generateTailwindContent("❌ Verification Failed", "Invalid token.", "bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100", "text-red-500")
    );
  }

  try {
    await authService.verifyEmailToken(token);

    return res.send(
      generateTailwindContent("✅ Email Verified", "Your email has been successfully verified.", "bg-gradient-to-br from-green-100 via-blue-100 to-indigo-100", "text-green-600")
    );
  } catch (err: any) {
    return res.status(400).send(
      generateTailwindContent("❌ Verification Failed", err.message || "Token invalid or expired", "bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100", "text-red-500")
    );
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