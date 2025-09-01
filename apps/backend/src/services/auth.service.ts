import { User } from '@prisma/client';
import * as UserService from './user.service';
import { hashPassword, comparePassword } from '@/utils/hash';
import { signToken } from '@/utils/jwt';
import { sendVerificationEmail } from '@/utils/email';
import { prisma } from '@/config/prisma';
import crypto from 'crypto';
import { generateTokens, refreshJWT, generateVerificationToken } from '@/utils/token';


export const register = async (
  username: string,
  email: string,
  password?: string | null
): Promise<Partial<User>> => {
  const existingUser = await UserService.findUserByEmail(email);
  if (existingUser) throw new Error('Email already registered');

  let password_hash: string | null = null;
  if (password) password_hash = await hashPassword(password);

  const newUser = await UserService.createUser({
    username,
    email,
    password_hash,
  });

  if (password_hash) {
    // generate hashed verification token
    const { token, tokenHash } = generateVerificationToken();

    await prisma.verificationToken.create({
      data: {
        user_id: newUser.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      },
    });

    await sendVerificationEmail(newUser.email, newUser.username, token);
  } else {
    // OAuth user: automatically verified
    await prisma.user.update({
      where: { id: newUser.id },
      data: { is_email_verified: true },
    });
  }

  const { password_hash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const login = async (
  email: string,
  password?: string | null
): Promise<{ user: Partial<User>; token: string; refreshToken: string }> => {
  const user = await UserService.findUserByEmail(email);
  if (!user) throw new Error('Invalid email or password');

  if (!user.is_email_verified) throw new Error('Please verify your email first');
  if (!user.password_hash) throw new Error('Please login using your OAuth provider');
  if (!password) throw new Error('Password required');

  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) throw new Error('Invalid email or password');

  // Generate JWT + refresh token
  const { token, refreshToken } = await generateTokens(user);

  const { password_hash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token, refreshToken };
};

export const verifyEmailToken = async (token: string) => {
  const record = await prisma.verificationToken.findUnique({
    where: { token_hash: token },
  });

  if (!record) throw new Error('Token invalid or expired');
  if (record.expires_at < new Date()) throw new Error('Token expired');

  // mark user as verified
  await prisma.user.update({
    where: { id: record.user_id },
    data: { is_email_verified: true },
  });

  // delete token
  await prisma.verificationToken.delete({
    where: { id: record.id },
  });

  return { message: 'Email verified successfully!' };
};
