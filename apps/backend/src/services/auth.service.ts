import * as userService from './user.service';
import { hashPassword, comparePassword } from '../utils/hash';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { generateAccessToken, verifyAccessToken } from '../utils/token';
import { createRefreshToken, revokeRefreshToken, verifyRefreshToken } from './resfreshToken.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Registration
export const register = async (username: string, email: string, password: string) => {
    if (!username || !email || !password) {
        throw new Error('Missing required fields');
    }

    // Check if username or email exists separately
    const existingByUsername = await userService.findUserByUsernameOrEmail(username);
    const existingByEmail = await userService.findUserByUsernameOrEmail(email);
    if (existingByUsername || existingByEmail) {
        throw new Error('Username or email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    return await userService.createUser(username, email, password_hash);
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

    // Return safe user data and token
    return { 
        accessToken,
        refreshToken: rawRefreshToken,
        user: { id: user.user_id, username: user.username, email: user.email }
    };
};


export const refreshTokens = async (rawRefreshToken: string) => {
    const storedToken = await verifyRefreshToken(rawRefreshToken);
    if (!storedToken) throw new Error('Invalid refresh token');

    // Rotate refresh token
    await revokeRefreshToken(storedToken.token_id);
    const newRawToken = crypto.randomBytes(64).toString('hex');
    await createRefreshToken(storedToken.user_id, newRawToken);

    const accessToken = generateAccessToken({ userId: storedToken.user_id });

    return { accessToken, refreshToken: newRawToken };
};

export const logout = async (rawRefreshToken: string) => {
    const storedToken = await verifyRefreshToken(rawRefreshToken);
    if (storedToken) await revokeRefreshToken(storedToken.token_id);
};