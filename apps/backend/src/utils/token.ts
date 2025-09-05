// Fix for apps/backend/src/utils/token.ts

import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AccessTokenPayload {
  userId: number;
  role?: string;
}

export interface EmailTokenPayload {
  userId: number;
  type: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  // Ensure secret is a string and not undefined
  const secret = config.jwt.secret;
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn: config.jwt.accessTokenExpiry 
  });
};

export const generateEmailToken = (userId: number): string => {
  const secret = config.jwt.secret;
  if (!secret) {
    throw new Error('JWT secret is not configured');
  }
  
  return jwt.sign(
    { userId, type: 'email_verification' },
    secret,
    { expiresIn: config.jwt.emailTokenExpiry }
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const secret = config.jwt.secret;
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    
    const decoded = jwt.verify(token, secret);
    
    // Type guard to ensure we have the right structure
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return decoded as AccessTokenPayload;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const verifyEmailToken = (token: string): EmailTokenPayload | null => {
  try {
    const secret = config.jwt.secret;
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    
    const decoded = jwt.verify(token, secret);
    
    // Type guard to ensure we have the right structure
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'type' in decoded) {
      return decoded as EmailTokenPayload;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Alternative implementation if you're still having issues:
export const generateAccessTokenAlt = (payload: AccessTokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateEmailTokenAlt = (userId: number): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  
  return jwt.sign(
    { userId, type: 'email_verification' },
    secret,
    { expiresIn: '24h' }
  );
};