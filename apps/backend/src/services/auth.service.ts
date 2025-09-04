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
export const sendVerificationEmail = async (user: { user_id: number, email: string }) => {
    const token = generateEmailToken(user.user_id);
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${url}">Verify Email</a>
    `;

    await sendEmail(user.email, 'Verify your email', html);
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