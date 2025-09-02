// apps/backend/src/services/auth.service.ts - Updated with Google token authentication
import { User } from '@prisma/client';
import * as UserService from './user.service';
import { hashPassword, comparePassword } from '@/utils/hash';
import { sendVerificationEmail } from '@/utils/email';
import { prisma } from '@/config/prisma';
import crypto from 'crypto';
import { generateTokens, refreshJWT, generateVerificationTokenSecure } from '@/utils/token';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { token, tokenHash } = generateVerificationTokenSecure();
    await prisma.verificationToken.create({
      data: {
        user_id: newUser.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    await sendVerificationEmail(newUser.email, newUser.username, token);
  } else {
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
    where: { token_hash: tokenHash }, // Use the hashed version
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

// New function to authenticate with Google ID token
export const authenticateWithGoogleToken = async (idToken: string) => {
  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email) {
      throw new Error('No email found in Google token');
    }

    let user = await UserService.findUserByEmail(email);

    if (!user) {
      // Create new user
      const username = name?.replace(/\s+/g, '').toLowerCase() || email.split('@')[0];
      
      // Ensure username is unique
      let uniqueUsername = username;
      let counter = 1;
      while (await UserService.findUserByUsername(uniqueUsername)) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      user = await UserService.createUser({
        username: uniqueUsername,
        email,
        password_hash: null, // OAuth user, no password
      });

      // Update with Google ID and verification status
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          google_id: googleId,
          is_email_verified: email_verified || true,
        },
      });

      // Create user profile if name or picture provided
      if (name || picture) {
        await prisma.userProfile.create({
          data: {
            user_id: user.id,
            fullname: name || null,
            avatar_url: picture || null,
          },
        });
      }
    } else {
      // User exists, update Google ID if not set
      if (!user.google_id) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            google_id: googleId,
            is_email_verified: true,
          },
        });
      }
    }

    // Generate tokens
    const { token, refreshToken } = await generateTokens(user);

    const { password_hash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  } catch (error: any) {
    console.error('Google token verification error:', error);
    throw new Error('Invalid Google token or authentication failed');
  }
};