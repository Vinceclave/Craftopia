// apps/backend/src/controllers/auth.controller.ts - STANDARDIZED VERSION
import { Request, Response } from "express";
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from "../middlewares/auth.middleware";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const user = await authService.register(username, email, password);
  
  // ✅ CONSISTENT: Always return null data with message for registration
  sendSuccess(res, null, 'User registered successfully. Please check your email for verification.', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  console.log('🔑 Login attempt for:', email);
  
  const result = await authService.login(email, password);
  
  console.log('✅ Login successful:', {
    hasAccessToken: !!result.accessToken,
    hasRefreshToken: !!result.refreshToken,
    hasUser: !!result.user,
    userId: result.user?.id
  });
  
  // ✅ CONSISTENT: Always wrap in data object
  sendSuccess(res, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      role: result.user.role,
      isEmailVerified: result.user.isEmailVerified
    }
  }, 'Login successful');
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
    const result = await authService.verifyEmail(token);
    
    // Check if it's a browser or API request
    const isMobile = req.headers['user-agent']?.includes('okhttp') || 
                     req.headers['user-agent']?.includes('Dart') ||
                     !req.headers.accept?.includes('text/html');
    
    if (isMobile) {
      // ✅ Mobile/API: Return consistent JSON response
      return sendSuccess(res, {
        verified: true,
        alreadyVerified: result.is_email_verified,
        user: {
          id: result.user_id,
          username: result.username,
          email: result.email
        }
      }, result.is_email_verified
        ? 'Email was already verified'
        : 'Email verified successfully');
    } else {
      // Web Browser: Redirect to frontend
      const successUrl = result.is_email_verified
        ? `${process.env.FRONTEND_URL || 'http://localhost:3001'}/email-verified?already=true`
        : `${process.env.FRONTEND_URL || 'http://localhost:3001'}/email-verified?success=true`;
      res.redirect(successUrl);
    }
  } catch (error: any) {
    console.error('Email verification error:', error);
    
    const isMobile = req.headers['user-agent']?.includes('okhttp') || 
                     req.headers['user-agent']?.includes('Dart');
    
    if (isMobile) {
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
  
  // ✅ CONSISTENT: Return data object
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