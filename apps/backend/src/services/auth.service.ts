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
import { AppError } from '../utils/error';
import { config } from '../config';
import prisma from '../config/prisma';

export const register = async (username: string, email: string, password: string) => {
  if (!username?.trim() || !email?.trim() || !password?.trim()) {
    throw new AppError('All fields are required', 400);
  }

  // Add password validation
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  const existingUser = await userService.findUserByUsernameOrEmail(username) 
                    || await userService.findUserByUsernameOrEmail(email);

  if (existingUser) {
    throw new AppError('Username or email already exists', 409);
  }

  const password_hash = await hashPassword(password);
  const user = await userService.createUser(username, email, password_hash);

  // Send verification email
  await sendVerificationEmail({ user_id: user.user_id, email: user.email });

  const { password_hash: _, ...safeUser } = user;
  return safeUser;
};


export const login = async (email: string, password: string) => {
  if (!email?.trim() || !password?.trim()) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await userService.findUserByUsernameOrEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // 🚫 Block login if email is not verified
  if (!user.is_email_verified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  // Create properly typed payload
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
};

export const refreshTokens = async (rawRefreshToken: string) => {
  const storedToken = await verifyRefreshToken(rawRefreshToken);
  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // ✅ DON'T revoke immediately - let it expire naturally or mark as "used"
  // await revokeRefreshToken(storedToken.token_id); // ❌ Remove this
  
  // ✅ Optional: Mark as used instead of deleting
  await prisma.refreshToken.update({
    where: { token_id: storedToken.token_id },
    data: { last_used: new Date() } // Add this field to schema
  });

  const newRawToken = crypto.randomBytes(64).toString('hex');
  await createRefreshToken(storedToken.user_id, newRawToken);

  const user = await userService.findUserById(storedToken.user_id);
  
  const tokenPayload: AccessTokenPayload = {
    userId: storedToken.user_id,
    role: user?.role || 'user'
  };

  const accessToken = generateAccessToken(tokenPayload);

  return { accessToken, refreshToken: newRawToken };
};

export const logout = async (rawRefreshToken?: string) => {
  if (!rawRefreshToken) return;
  
  const storedToken = await verifyRefreshToken(rawRefreshToken);
  if (storedToken) {
    await revokeRefreshToken(storedToken.token_id);
  }
};

export const changePassword = async (userId: number, currentPassword: string, newPassword: string) => {
  if (!currentPassword?.trim() || !newPassword?.trim()) {
    throw new AppError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long', 400);
  }

  const user = await userService.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  const newPasswordHash = await hashPassword(newPassword);
  
  return await prisma.user.update({
    where: { user_id: userId },
    data: { password_hash: newPasswordHash },
    select: { user_id: true, username: true, email: true }
  });
};

export const forgotPassword = async (email: string) => {
  if (!email?.trim()) {
    throw new AppError('Email is required', 400);
  }

  const user = await userService.findUserByUsernameOrEmail(email);
  if (!user) {
    // Don't reveal if email exists or not
    return { message: 'If the email exists, password reset instructions have been sent' };
  }

  const resetToken = generateEmailToken(user.user_id);
  
  // Send password reset email
  await sendPasswordResetEmail({ user_id: user.user_id, email: user.email }, resetToken);
  
  return { message: 'Password reset instructions sent to your email' };
};

export const resetPassword = async (token: string, newPassword: string) => {
  if (!token?.trim() || !newPassword?.trim()) {
    throw new AppError('Token and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  const payload = verifyEmailToken(token);
  if (!payload || payload.type !== 'email_verification') {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const newPasswordHash = await hashPassword(newPassword);
  
  return await prisma.user.update({
    where: { user_id: payload.userId },
    data: { password_hash: newPasswordHash },
    select: { user_id: true, username: true, email: true }
  });
};

// Helper function for password reset email
const sendPasswordResetEmail = async (user: { user_id: number; email: string }, token: string) => {
  const url = `${config.frontend.url}/api/v1/auth/reset-password?token=${token}`;
  const userName = user.email.split('@')[0];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Password Reset - Craftopia</title>
    </head>
    <body style="font-family: Inter, sans-serif; background-color: #F9FAFB; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; padding: 40px; border: 1px solid #F3F4F6;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #F3F4F6; padding-bottom: 20px;">
          <div style="font-size: 24px; font-weight: 800; color: #6D28D9; margin-bottom: 5px;">CRAFTOPIA</div>
          <div style="font-size: 14px; color: #6B7280;">Password Reset Request</div>
        </div>
        
        <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 15px;">Reset Your Password</h1>
        
        <p style="color: #6B7280; margin-bottom: 20px;">
          Hello <span style="color: #0891B2; font-weight: 500;">${userName}</span>,
        </p>
        
        <p style="color: #6B7280; margin-bottom: 20px;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <a href="${url}" style="display: inline-block; background-color: #6D28D9; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-bottom: 25px;">Reset Password</a>
        
        <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
          This link expires in <span style="color: #DC2626; font-weight: 500;">24 hours</span>. 
          If you didn't request this reset, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, 'Reset Your Craftopia Password', html);
};


const sendVerificationEmail = async (user: { user_id: number; email: string }) => {
  const token = generateEmailToken(user.user_id);
  const verificationUrl = `${config.frontend.url}/api/v1/auth/verify-email?token=${token}`;
  const userName = user.email.split('@')[0];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Account - Craftopia</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #F9FAFB; color: #111827; line-height: 1.6; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #F3F4F6; padding: 40px;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #F3F4F6; padding-bottom: 20px;">
          <div style="font-size: 24px; font-weight: 800; color: #004E98; margin-bottom: 5px;">CRAFTOPIA</div>
          <div style="font-size: 14px; color: #6B7280;">AI-Powered Sustainable Upcycling</div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 15px; margin-top: 0;">Welcome to Craftopia!</h1>
          
          <p style="font-size: 15px; color: #6B7280; margin-bottom: 20px;">
            Hello <span style="color: #004E98; font-weight: 500;">${userName}</span>,
          </p>
          
          <p style="font-size: 15px; color: #6B7280; margin-bottom: 20px;">
            Please verify your email address to complete your registration and start creating amazing projects.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #004E98; color: #FFFFFF; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
          </div>
          
          <p style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          
          <div style="border: 1px solid #F3F4F6; background-color: #F9FAFB; padding: 10px; text-align: center; margin-bottom: 20px; word-break: break-all;">
            <a href="${verificationUrl}" style="color: #004E98; text-decoration: none; font-size: 12px;">${verificationUrl}</a>
          </div>

          <p style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">
            Or use this verification token in the mobile app:
          </p>
          
          <div style="border: 1px solid #F3F4F6; background-color: #F9FAFB; padding: 15px; text-align: center; margin-bottom: 25px;">
            <div style="font-family: monospace; font-size: 16px; font-weight: 600; color: #004E98;">${token}</div>
          </div>
        </div>
        
        <div style="border-top: 1px solid #F3F4F6; padding-top: 20px; text-align: center;">
          <p style="font-size: 13px; color: #6B7280; margin-bottom: 8px;">
            This link expires in <span style="color: #DC2626; font-weight: 500;">24 hours</span>
          </p>
          <p style="font-size: 13px; color: #6B7280; margin-bottom: 0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, 'Verify Your Craftopia Account', html);
};

export const verifyEmail = async (token: string) => {
  if (!token?.trim()) {
    throw new AppError('Verification token is required', 400);
  }

  let payload;
  try {
    payload = verifyEmailToken(token);
    console.log('Token payload:', payload);
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new AppError('Invalid or expired verification token', 400);
  }

  if (!payload || payload.type !== 'email_verification') {
    throw new AppError('Invalid verification token format', 400);
  }

  const user = await userService.findUserById(payload.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.is_email_verified) {
    throw new AppError('Email is already verified', 400);
  }

  return userService.markUserAsVerified(payload.userId);
};


export const resendVerificationEmail = async (email: string) => {
  if (!email?.trim()) {
    throw new AppError('Email is required', 400);
  }

  const user = await userService.findUserByUsernameOrEmail(email);
  console.log(user)

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.is_email_verified) {
    throw new AppError('Email is already verified', 400);
  }

  await sendVerificationEmail({ user_id: user.user_id, email: user.email });
  return { message: 'Verification email sent successfully' };
};