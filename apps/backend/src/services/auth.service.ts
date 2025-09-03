// apps/backend/src/services/auth.service.ts - Updated with Google token authentication
import { User } from '@prisma/client';
import * as UserService from './user.service';
import { hashPassword, comparePassword } from '@/utils/hash';
import { sendVerificationEmail } from '@/utils/email';
import { prisma } from '@/config/prisma';
import crypto from 'crypto';
import { generateTokens, refreshJWT, generateVerificationTokenSecure } from '@/utils/token';

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<Partial<User>> => {
  const existingUser = await UserService.findUserByEmail(email);
  if (existingUser) throw new Error('Email already registered');

  const password_hash = await hashPassword(password);

  const newUser = await UserService.createUser({
    username,
    email,
    password_hash,
  });

  // Generate verification token for email verification
  const { token, tokenHash } = generateVerificationTokenSecure();
  await prisma.verificationToken.create({
    data: {
      user_id: newUser.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    },
  });
  
  await sendVerificationEmail(newUser.email, newUser.username, token);

  const { password_hash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};


export const login = async (
  email: string,
  password: string
): Promise<{ user: Partial<User>; token: string; refreshToken: string }> => {
  const user = await UserService.findUserByEmail(email);
  if (!user) throw new Error('Invalid email or password');

  if (!user.is_email_verified) throw new Error('Please verify your email first');
  if (!user.password_hash) throw new Error('Account exists but no password set');

  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) throw new Error('Invalid email or password');

  const { token, refreshToken } = await generateTokens(user);
  const { password_hash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token, refreshToken };
};


export const verifyEmailToken = async (token: string) => {
  console.log('🔍 Received token:', token);
  
  // Hash the received token to match what's stored in database
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  console.log('🔍 Looking for hash:', tokenHash);
  
  const record = await prisma.verificationToken.findUnique({
    where: { token_hash: tokenHash },
  });

  if (!record) {
    console.log('🔍 Token not found in database');
    throw new Error('Token invalid or expired');
  }
  
  if (record.expires_at < new Date()) {
    console.log('🔍 Token is expired');
    throw new Error('Token expired');
  }

  console.log('🔍 Token is valid, verifying user...');
  
  await prisma.user.update({
    where: { id: record.user_id },
    data: { is_email_verified: true },
  });

  await prisma.verificationToken.delete({
    where: { id: record.id },
  });

  console.log('🔍 Email verified successfully!');
  return { message: 'Email verified successfully!' };
};

// Refresh access token using refresh token
export const refreshAccessToken = async (refreshTokenString: string) => {
  try {
    const result = await refreshJWT(refreshTokenString);
    return result;
  } catch (error: any) {
    throw new Error('Invalid or expired refresh token');
  }
};