import { Request, Response, NextFunction } from "express";
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from "../middlewares/auth.middleware";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const user = await authService.register(username, email, password);
  sendSuccess(res, null, 'User registered successfully. Please check your email for verification.', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendSuccess(res, result, 'Login successful');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken);
  sendSuccess(res, result, 'Tokens refreshed successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, null, 'Logged out successfully');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Verification token is required',
      timestamp: new Date().toISOString()
    });
  }
  
  try {
    const user = await authService.verifyEmail(token);
    
    // For web browsers, redirect to success page
    if (req.headers['user-agent']?.includes('Mobile')) {
      sendSuccess(res, null, 'Email verified successfully');
    } else {
      // Redirect to frontend success page for web browsers
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/email-verified?success=true`);
    }
  } catch (error: any) {
    console.error('Email verification error:', error);
    
    if (req.headers['user-agent']?.includes('Mobile')) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid or expired verification token',
        timestamp: new Date().toISOString()
      });
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/email-verified?error=${encodeURIComponent(error.message)}`);
    }
  }
});

export const requestEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.resendVerificationEmail(email);
  sendSuccess(res, result, 'Verification email sent successfully');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user!.userId, currentPassword, newPassword);
  sendSuccess(res, null, 'Password changed successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  sendSuccess(res, result, 'Password reset instructions sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  sendSuccess(res, null, 'Password reset successfully');
});