// apps/backend/src/services/auth.service.ts - FIXED VERSION WITH DEEP LINK SUPPORT
import crypto from 'crypto';
import * as userService from './user.service';
import { hashPassword, comparePassword } from '../utils/hash';
import { sendEmail } from '../utils/mailer';
import { 
  generateAccessToken, 
  generateEmailToken, 
  verifyEmailToken,
  type AccessTokenPayload 
} from '../utils/token';
import { createRefreshToken, revokeRefreshToken, verifyRefreshToken } from './resfreshToken.service';
import { 
  ValidationError, 
  UnauthorizedError, 
  ForbiddenError,
  NotFoundError,
  ConflictError 
} from '../utils/error';
import { config } from '../config';
import prisma from '../config/prisma';

class AuthService {
  // Register new user
  async register(username: string, email: string, password: string) {
    // Validate inputs
    if (!username?.trim()) {
      throw new ValidationError('Username is required');
    }
    if (!email?.trim()) {
      throw new ValidationError('Email is required');
    }
    if (!password?.trim()) {
      throw new ValidationError('Password is required');
    }
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Check if user exists
    const existingUser = await userService.findUserByUsernameOrEmail(username) 
                      || await userService.findUserByUsernameOrEmail(email);

    if (existingUser) {
      throw new ConflictError('Username or email already exists');
    }

    // Create user
    const password_hash = await hashPassword(password);
    const user = await userService.createUser(username, email, password_hash);

    // Send verification email
    await this.sendVerificationEmail({ 
      user_id: user.user_id, 
      email: user.email 
    });

    const { password_hash: _, ...safeUser } = user;
    return safeUser;
  }

  // Login user
  async login(email: string, password: string) {
    // Validate inputs
    if (!email?.trim()) {
      throw new ValidationError('Email is required');
    }
    if (!password?.trim()) {
      throw new ValidationError('Password is required');
    }

    // Find user
    const user = await userService.findUserByUsernameOrEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if account is deleted
    if (user.deleted_at !== null) {
      throw new ForbiddenError('This account has been deleted. Please contact support.');
    }

    // Check if account is not active
    if (!user.is_active) {
      throw new ForbiddenError('This account has been banned. Please contact support.');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check email verification
    if (!user.is_email_verified) {
      throw new ForbiddenError('Please verify your email before logging in.');
    }

    // Generate tokens
    const tokenPayload: AccessTokenPayload = {
      userId: user.user_id,
      role: user.role || 'user'
    };

    const accessToken = generateAccessToken(tokenPayload);
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    await createRefreshToken(user.user_id, rawRefreshToken);

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.is_email_verified
      }
    };
  }

  // Refresh tokens
  async refreshTokens(rawRefreshToken: string) {
    if (!rawRefreshToken?.trim()) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const storedToken = await verifyRefreshToken(rawRefreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Update last used timestamp
    await prisma.refreshToken.update({
      where: { token_id: storedToken.token_id },
      data: { last_used: new Date() }
    });

    // Generate new tokens
    const newRawToken = crypto.randomBytes(64).toString('hex');
    await createRefreshToken(storedToken.user_id, newRawToken);

    const user = await userService.findUserById(storedToken.user_id);
    
    const tokenPayload: AccessTokenPayload = {
      userId: storedToken.user_id,
      role: user?.role || 'user'
    };

    const accessToken = generateAccessToken(tokenPayload);

    return { accessToken, refreshToken: newRawToken };
  }

  // Logout user
  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    
    const storedToken = await verifyRefreshToken(rawRefreshToken);
    if (storedToken) {
      await revokeRefreshToken(storedToken.token_id);
    }
  }

  // Change password
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    // Validate inputs
    if (!currentPassword?.trim()) {
      throw new ValidationError('Current password is required');
    }
    if (!newPassword?.trim()) {
      throw new ValidationError('New password is required');
    }
    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters long');
    }

    // Find user
    const user = await userService.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect');
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);
    
    return await prisma.user.update({
      where: { user_id: userId },
      data: { password_hash: newPasswordHash },
      select: { user_id: true, username: true, email: true }
    });
  }

  // Forgot password
  async forgotPassword(email: string) {
    if (!email?.trim()) {
      throw new ValidationError('Email is required');
    }

    const user = await userService.findUserByUsernameOrEmail(email);
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return { 
        message: 'If the email exists, password reset instructions have been sent' 
      };
    }

    const resetToken = generateEmailToken(user.user_id);
    await this.sendPasswordResetEmail(
      { user_id: user.user_id, email: user.email }, 
      resetToken
    );
    
    return { 
      message: 'Password reset instructions sent to your email' 
    };
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    // Validate inputs
    if (!token?.trim()) {
      throw new ValidationError('Token is required');
    }
    if (!newPassword?.trim()) {
      throw new ValidationError('New password is required');
    }
    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // Verify token
    const payload = verifyEmailToken(token);
    if (!payload || payload.type !== 'email_verification') {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);
    
    return await prisma.user.update({
      where: { user_id: payload.userId },
      data: { password_hash: newPasswordHash },
      select: { user_id: true, username: true, email: true }
    });
  }

  // Verify email
  async verifyEmail(token: string) {
    if (!token?.trim()) {
      throw new ValidationError('Verification token is required');
    }

    let payload;
    try {
      payload = verifyEmailToken(token);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired verification token');
    }

    if (!payload || payload.type !== 'email_verification') {
      throw new UnauthorizedError('Invalid verification token format');
    }

    const user = await userService.findUserById(payload.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.is_email_verified) {
      // Return user info even if already verified (don't throw error)
      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        is_email_verified: true
      };
    }

    return userService.markUserAsVerified(payload.userId);
  }

  // Resend verification email
  async resendVerificationEmail(email: string) {
    if (!email?.trim()) {
      throw new ValidationError('Email is required');
    }

    const user = await userService.findUserByUsernameOrEmail(email);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.is_email_verified) {
      throw new ValidationError('Email is already verified');
    }

    await this.sendVerificationEmail({ 
      user_id: user.user_id, 
      email: user.email 
    });
    
    return { message: 'Verification email sent successfully' };
  }

  // ✅ NEW: Helper - Get deep link URL for mobile app
  private getDeepLinkUrl(path: string, token: string): string {
    // For mobile app, use custom scheme
    // For web, use frontend URL
    const isMobileEnvironment = process.env.USE_MOBILE_DEEP_LINKS === 'true';
    
    if (isMobileEnvironment) {
      // Mobile deep link format: craftopia://auth/verify-email?token=xyz
      return `craftopia://auth/${path}?token=${encodeURIComponent(token)}`;
    } else {
      // Web redirect format
      const frontendUrl = config.frontend.url;
      return `${frontendUrl}/${path}?token=${encodeURIComponent(token)}`;
    }
  }

  // ✅ IMPROVED: Helper - Send verification email with smart deep linking
  private async sendVerificationEmail(user: { user_id: number; email: string }) {
    const token = generateEmailToken(user.user_id);
    
    // ✅ Use backend URL for the verification endpoint (handles both mobile and web)
    const backendUrl = process.env.BACKEND_URL;
    console.log('Backend URL for email links:', backendUrl);
    const verificationUrl = `${backendUrl}/api/v1/auth/verify-email?token=${token}`;
    const userName = user.email.split('@')[0];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Account - Craftopia</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F9FAFB;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #F3F4F6; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #F3F4F6; padding-bottom: 20px;">
            <div style="font-size: 24px; font-weight: 800; color: #004E98;">🎨 CRAFTOPIA</div>
          </div>
          
          <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 16px;">Welcome to Craftopia!</h1>
          
          <p style="color: #6B7280; margin-bottom: 8px;">Hello <strong style="color: #004E98;">${userName}</strong>,</p>
          
          <p style="color: #6B7280; margin-bottom: 24px;">Thanks for signing up! Please verify your email address to complete your registration and start your crafting journey.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #004E98; color: #FFFFFF; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
          </div>
          
          <p style="font-size: 13px; color: #6B7280; margin-top: 24px;">
            This link expires in <strong>24 hours</strong>. If you didn't create a Craftopia account, you can safely ignore this email.
          </p>
          
          <p style="font-size: 11px; color: #9CA3AF; margin-top: 16px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #004E98; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #F3F4F6;">
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
              © ${new Date().getFullYear()} Craftopia. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return sendEmail(user.email, 'Verify Your Craftopia Account', html);
  }

  // ✅ IMPROVED: Helper - Send password reset email with smart deep linking
  private async sendPasswordResetEmail(user: { user_id: number; email: string }, token: string) {
    // ✅ Use backend URL for mobile deep linking redirect
    const backendUrl = process.env.BACKEND_URL;
    const resetUrl = `${backendUrl}/api/v1/auth/reset-password-redirect?token=${token}`;
    const userName = user.email.split('@')[0];

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset - Craftopia</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F9FAFB;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #F3F4F6; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #F3F4F6; padding-bottom: 20px;">
            <div style="font-size: 24px; font-weight: 800; color: #6D28D9;">🔒 CRAFTOPIA</div>
          </div>
          
          <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 16px;">Reset Your Password</h1>
          
          <p style="color: #6B7280; margin-bottom: 8px;">Hello <strong style="color: #6D28D9;">${userName}</strong>,</p>
          
          <p style="color: #6B7280; margin-bottom: 24px;">We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #6D28D9; color: #FFFFFF; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
          </div>
          
          <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #92400E;">
              <strong>Security Note:</strong> This link expires in <strong>24 hours</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <p style="font-size: 11px; color: #9CA3AF; margin-top: 24px;">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${resetUrl}" style="color: #6D28D9; word-break: break-all; font-size: 10px;">${resetUrl}</a>
          </p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #F3F4F6;">
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
              © ${new Date().getFullYear()} Craftopia. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return sendEmail(user.email, 'Reset Your Craftopia Password', html);
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export individual functions for backward compatibility
export const register = authService.register.bind(authService);
export const login = authService.login.bind(authService);
export const refreshTokens = authService.refreshTokens.bind(authService);
export const logout = authService.logout.bind(authService);
export const changePassword = authService.changePassword.bind(authService);
export const forgotPassword = authService.forgotPassword.bind(authService);
export const resetPassword = authService.resetPassword.bind(authService);
export const verifyEmail = authService.verifyEmail.bind(authService);
export const resendVerificationEmail = authService.resendVerificationEmail.bind(authService);