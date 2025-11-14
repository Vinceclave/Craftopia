import { Request, Response } from "express";
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from "../middlewares/auth.middleware";
import { logger } from "../utils/logger";
import { config } from "../config";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  
  logger.info('User registration attempt', { username, email });
  
  await authService.register(username, email, password);
  
  logger.info('User registered successfully', { email });
  
  sendSuccess(
    res, 
    null, 
    'User registered successfully. Please check your email for verification.', 
    201
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  logger.info('Login attempt', { email });
  
  const result = await authService.login(email, password);
  
  logger.info('Login successful', { 
    userId: result.user.id,
    role: result.user.role 
  });
  
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
  
  logger.debug('Token refresh attempt');
  
  const result = await authService.refreshTokens(refreshToken);
  
  logger.debug('Tokens refreshed successfully');
  
  sendSuccess(res, result, 'Tokens refreshed successfully');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  
  logger.info('Logout attempt');
  
  await authService.logout(refreshToken);
  
  logger.info('User logged out successfully');
  
  sendSuccess(res, null, 'Logged out successfully');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    logger.warn('Email verification attempted without token');
    return res.status(400).json({ 
      success: false, 
      error: 'Verification token is required',
      timestamp: new Date().toISOString()
    });
  }
  
  logger.info('Email verification attempt');
  
  try {
    const result = await authService.verifyEmail(token);
    
    logger.info('Email verified successfully', { userId: result.user_id });
    
    // Check if it's a mobile/API request or browser
    const isMobile = req.headers['user-agent']?.includes('okhttp') || 
                     req.headers['user-agent']?.includes('Dart') ||
                     !req.headers.accept?.includes('text/html');
    
    if (isMobile) {
      // Mobile/API: Return JSON response
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
        ? `${config.frontend.url}/email-verified?already=true`
        : `${config.frontend.url}/email-verified?success=true`;
      res.redirect(successUrl);
    }
  } catch (error: any) {
    logger.error('Email verification failed', error);
    
    const isMobile = req.headers['user-agent']?.includes('okhttp') || 
                     req.headers['user-agent']?.includes('Dart');
    
    if (isMobile) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid or expired verification token',
        timestamp: new Date().toISOString()
      });
    } else {
      res.redirect(`${config.frontend.url}/email-verified?error=${encodeURIComponent(error.message)}`);
    }
  }
});

export const requestEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  logger.info('Email verification resend request', { email });
  
  const result = await authService.resendVerificationEmail(email);
  
  logger.info('Verification email sent', { email });
  
  sendSuccess(res, result, 'Verification email sent successfully');
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.userId;
  
  logger.info('Password change attempt', { userId });
  
  await authService.changePassword(userId, currentPassword, newPassword);
  
  logger.info('Password changed successfully', { userId });
  
  sendSuccess(res, null, 'Password changed successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  logger.info('Password reset request', { email });
  
  const result = await authService.forgotPassword(email);
  
  logger.info('Password reset email sent', { email });
  
  sendSuccess(res, result, 'Password reset instructions sent');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  
  logger.info('Password reset attempt');
  
  await authService.resetPassword(token, newPassword);
  
  logger.info('Password reset successful');
  
  sendSuccess(res, null, 'Password reset successfully');
});

// ✅ NEW: Reset password redirect endpoint (for email links)
export const resetPasswordRedirect = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    logger.warn('Reset password redirect attempted without token');
    return res.status(400).json({ 
      success: false, 
      error: 'Reset token is required',
      timestamp: new Date().toISOString()
    });
  }
  
  logger.info('Reset password redirect');
  
  // Check if it's a mobile/API request or browser
  const isMobile = req.headers['user-agent']?.includes('okhttp') || 
                   req.headers['user-agent']?.includes('Dart') ||
                   !req.headers.accept?.includes('text/html');
  
  if (isMobile) {
    // Mobile: Return JSON with token for the app to handle
    return sendSuccess(res, {
      token,
      message: 'Use this token to reset your password'
    }, 'Reset token validated');
  } else {
    // Web Browser: Redirect to frontend reset password page
    const resetUrl = `${config.frontend.url}/reset-password?token=${encodeURIComponent(token)}`;
    res.redirect(resetUrl);
  }
});