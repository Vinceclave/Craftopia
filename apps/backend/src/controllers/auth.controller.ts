// apps/backend/src/controllers/auth.controller.ts - IMPROVED WITH DEEP LINK SUPPORT
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

// ✅ IMPROVED: Email verification with better mobile/web detection
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
    
    // ✅ Detect if request is from mobile app
    const userAgent = req.headers['user-agent'] || '';
    const isMobileApp = 
      userAgent.includes('okhttp') || 
      userAgent.includes('Dart') || 
      userAgent.includes('Expo') ||
      req.headers.accept?.includes('application/json');
    
    if (isMobileApp) {
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
      // Web Browser or Email Client: Redirect with deep link
      const deepLinkUrl = `craftopia://auth/verify-email?token=${encodeURIComponent(token)}`;
      
      // Create an HTML page that attempts deep link, then shows success
      const htmlResponse = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified - Craftopia</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              padding: 48px 32px;
              max-width: 480px;
              width: 100%;
              text-align: center;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
              animation: bounce 1s ease-in-out;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
            h1 {
              color: #1a202c;
              font-size: 28px;
              margin-bottom: 16px;
              font-weight: 700;
            }
            p {
              color: #4a5568;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 14px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s, box-shadow 0.2s;
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            .subtitle {
              font-size: 14px;
              color: #718096;
              margin-top: 24px;
            }
            .loading {
              display: inline-block;
              margin-top: 16px;
            }
            .spinner {
              border: 3px solid #f3f3f3;
              border-top: 3px solid #667eea;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🎉</div>
            <h1>Email Verified!</h1>
            <p>${result.is_email_verified 
              ? 'Your email was already verified. You can now sign in to your account.' 
              : 'Your email has been successfully verified! You can now sign in to your Craftopia account.'
            }</p>
            
            <div id="appStatus">
              <a href="${deepLinkUrl}" class="button" id="openAppBtn">Open Craftopia App</a>
              <p class="subtitle">If the app doesn't open automatically, click the button above.</p>
            </div>
          </div>
          
          <script>
            // Attempt to open the app automatically
            window.location.href = '${deepLinkUrl}';
            
            // If user is still on page after 2 seconds, show the button
            setTimeout(() => {
              document.getElementById('openAppBtn').style.display = 'inline-block';
            }, 2000);
          </script>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlResponse);
    }
  } catch (error: any) {
    logger.error('Email verification failed', error);
    
    const userAgent = req.headers['user-agent'] || '';
    const isMobileApp = 
      userAgent.includes('okhttp') || 
      userAgent.includes('Dart') || 
      userAgent.includes('Expo');
    
    if (isMobileApp) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Invalid or expired verification token',
        timestamp: new Date().toISOString()
      });
    } else {
      // Error page for web
      const errorHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Failed - Craftopia</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              padding: 48px 32px;
              max-width: 480px;
              width: 100%;
              text-align: center;
            }
            .icon { font-size: 64px; margin-bottom: 24px; }
            h1 { color: #1a202c; font-size: 28px; margin-bottom: 16px; font-weight: 700; }
            p { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
            .button {
              display: inline-block;
              background: #f5576c;
              color: white;
              padding: 14px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              margin-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h1>Verification Failed</h1>
            <p>${error.message || 'Invalid or expired verification token'}</p>
            <p>Please request a new verification email from the app.</p>
            <a href="craftopia://auth/login" class="button">Open Craftopia App</a>
          </div>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.status(400).send(errorHtml);
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

// ✅ IMPROVED: Reset password redirect endpoint with deep link support
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
  
  // ✅ Detect if request is from mobile app
  const userAgent = req.headers['user-agent'] || '';
  const isMobileApp = 
    userAgent.includes('okhttp') || 
    userAgent.includes('Dart') || 
    userAgent.includes('Expo') ||
    req.headers.accept?.includes('application/json');
  
  if (isMobileApp) {
    // Mobile: Return JSON with token
    return sendSuccess(res, {
      token,
      message: 'Use this token to reset your password'
    }, 'Reset token validated');
  } else {
    // Web Browser or Email Client: Redirect with deep link
    const deepLinkUrl = `craftopia://auth/reset-password?token=${encodeURIComponent(token)}`;
    
    // Create an HTML page that attempts deep link
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password - Craftopia</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 48px 32px;
            max-width: 480px;
            width: 100%;
            text-align: center;
          }
          .icon { font-size: 64px; margin-bottom: 24px; }
          h1 { color: #1a202c; font-size: 28px; margin-bottom: 16px; font-weight: 700; }
          p { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 32px; }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .subtitle {
            font-size: 14px;
            color: #718096;
            margin-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🔒</div>
          <h1>Reset Your Password</h1>
          <p>Click the button below to reset your password in the Craftopia app.</p>
          
          <a href="${deepLinkUrl}" class="button" id="openAppBtn">Open Craftopia App</a>
          <p class="subtitle">If the app doesn't open automatically, click the button above.</p>
        </div>
        
        <script>
          // Attempt to open the app automatically
          window.location.href = '${deepLinkUrl}';
        </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlResponse);
  }
});