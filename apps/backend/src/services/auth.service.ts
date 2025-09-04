import crypto from 'crypto';
import * as userService from './user.service';
import { hashPassword, comparePassword } from '../utils/hash';
import { sendEmail } from '../utils/mailer';
import { generateAccessToken, generateEmailToken, verifyEmailToken } from '../utils/token';
import { createRefreshToken, revokeRefreshToken, verifyRefreshToken } from './resfreshToken.service';

// Registration
export const register = async (username: string, email: string, password: string) => {
    if (!username || !email || !password) throw new Error('Missing required fields');

    const existingUser = await userService.findUserByUsernameOrEmail(username) 
                      || await userService.findUserByUsernameOrEmail(email);

    if (existingUser) throw new Error('Username or email already exists');

    const password_hash = await hashPassword(password);
    const user = await userService.createUser(username, email, password_hash);

    // Send verification email
    await sendVerificationEmail({ user_id: user.user_id, email: user.email });

    const { password_hash: _, ...safeUser } = user;
    return safeUser;
};

// Login
export const login = async (identifier: string, password: string) => {
    const user = await userService.findUserByUsernameOrEmail(identifier);
    if (!user) throw new Error('Invalid username or password');

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) throw new Error('Invalid username or password');

    const accessToken = generateAccessToken({ userId: user.user_id });
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    await createRefreshToken(user.user_id, rawRefreshToken);

    return { 
        accessToken,
        refreshToken: rawRefreshToken,
        user: { id: user.user_id, username: user.username, email: user.email }
    };
};

// Refresh tokens
export const refreshTokens = async (rawRefreshToken: string) => {
    const storedToken = await verifyRefreshToken(rawRefreshToken);
    if (!storedToken) throw new Error('Invalid refresh token');

    await revokeRefreshToken(storedToken.token_id);
    const newRawToken = crypto.randomBytes(64).toString('hex');
    await createRefreshToken(storedToken.user_id, newRawToken);

    const accessToken = generateAccessToken({ userId: storedToken.user_id });
    return { accessToken, refreshToken: newRawToken };
};

// Logout
export const logout = async (rawRefreshToken: string) => {
    if (!rawRefreshToken) return;
    const storedToken = await verifyRefreshToken(rawRefreshToken);
    if (storedToken) await revokeRefreshToken(storedToken.token_id);
};
// Send verification email
export const sendVerificationEmail = async (user: { user_id: number; email: string }) => {
  const token = generateEmailToken(user.user_id);
  const url = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
  const userName = user.email.split('@')[0];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify Your Account - Craftopia</title>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #F9FAFB;
      color: #111827;
      line-height: 1.6;
      font-weight: 400;
      padding: 20px;
    ">
      <div style="
        max-width: 500px;
        margin: 0 auto;
        background-color: #FFFFFF;
        border: 1px solid #F3F4F6;
        padding: 40px;
      ">
        
        <div style="
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 1px solid #F3F4F6;
          padding-bottom: 20px;
        ">
          <div style="
            font-size: 24px;
            font-weight: 800;
            color: #6D28D9;
            margin-bottom: 5px;
            letter-spacing: -0.5px;
          ">CRAFTOPIA</div>
          <div style="
            font-size: 14px;
            color: #6B7280;
          ">AI-Powered Sustainable Upcycling</div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h1 style="
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 15px;
            letter-spacing: -0.3px;
            margin-top: 0;
          ">Welcome to Craftopia!</h1>
          
          <p style="
            font-size: 15px;
            color: #6B7280;
            margin-bottom: 20px;
          ">
            Hello <span style="color: #0891B2; font-weight: 500;">${userName}</span>,
          </p>
          
          <p style="
            font-size: 15px;
            color: #6B7280;
            margin-bottom: 20px;
          ">
            Verify your email to start transforming waste into creative DIY projects with AI-powered craft ideas.
          </p>
          
          <a href="${url}" style="
            display: inline-block;
            background-color: #6D28D9;
            color: #FFFFFF;
            text-decoration: none;
            padding: 12px 24px;
            border: 1px solid #6D28D9;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 25px;
            letter-spacing: -0.1px;
          ">Verify Email Address</a>
          
          <div style="
            text-align: center;
            color: #6B7280;
            font-size: 14px;
            margin: 20px 0;
          ">or use this code</div>
          
          <div style="
            border: 1px solid #F3F4F6;
            background-color: #F9FAFB;
            padding: 15px;
            text-align: center;
            margin-bottom: 25px;
          ">
            <div style="
              font-family: monospace;
              font-size: 16px;
              font-weight: 600;
              color: #6D28D9;
              letter-spacing: 1px;
            ">${token}</div>
          </div>
        </div>
        
        <div style="
          border-top: 1px solid #F3F4F6;
          padding-top: 20px;
          text-align: center;
        ">
          <p style="
            font-size: 13px;
            color: #6B7280;
            margin-bottom: 8px;
          ">
            This link expires in <span style="color: #DC2626; font-weight: 500;">24 hours</span>
          </p>
          <p style="
            font-size: 13px;
            color: #6B7280;
            margin-bottom: 0;
          ">
            support@craftopia.com
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  return sendEmail(user.email, 'Verify Your Craftopia Account', html);
};

// Verify email token
export const verifyEmail = async (token: string) => {
    if (!token) throw new Error('Token is required');

    const payload = verifyEmailToken(token);
    if (!payload || payload.type !== 'email_verification') throw new Error('Invalid or expired token');

    return userService.markUserAsVerified(payload.userId);
};

export const resendVerificationEmail = async (email: string) => {
    if (!email) throw new Error('Email is required');

    // Find user by email
    const user = await userService.findUserByUsernameOrEmail(email);
    if (!user) throw new Error('User not found');

    if (user.is_email_verified) {
        throw new Error('Email is already verified');
    }

    // Send a new verification email
    await sendVerificationEmail({ user_id: user.user_id, email: user.email });
    return { message: 'Verification email sent successfully' };
};