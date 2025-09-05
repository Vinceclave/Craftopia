import prisma from "../config/prisma";
import { hashToken, compareToken } from "../utils/hash";
import { addDays } from 'date-fns';
import { AppError } from '../utils/error';

export const createRefreshToken = async (userId: number, rawToken: string) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  if (!rawToken?.trim()) {
    throw new AppError('Token is required', 400);
  }

  const tokenHash = await hashToken(rawToken);
  const expiredAt = addDays(new Date(), 7);

  return prisma.refreshToken.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiredAt,
    },
  });
};

export const verifyRefreshToken = async (rawToken: string) => {
  if (!rawToken?.trim()) return null;
  
  const tokens = await prisma.refreshToken.findMany({
    where: {
      expires_at: {
        gt: new Date()
      }
    }
  });

  for (const t of tokens) {
    try {
      const match = await compareToken(rawToken, t.token_hash);
      if (match) return t;
    } catch (error) {
      continue;
    }
  }
  return null;
};

export const revokeRefreshToken = async (tokenIdOrRawToken: number | string) => {
  try {
    if (typeof tokenIdOrRawToken === 'number') {
      await prisma.refreshToken.delete({ 
        where: { token_id: tokenIdOrRawToken }
      });
    } else {
      const storedToken = await verifyRefreshToken(tokenIdOrRawToken);
      if (storedToken) {
        await prisma.refreshToken.delete({ 
          where: { token_id: storedToken.token_id }
        });
      }
    }
  } catch (error) {
    // Token might already be deleted, which is fine
    console.warn('Error revoking token:', error);
  }
};