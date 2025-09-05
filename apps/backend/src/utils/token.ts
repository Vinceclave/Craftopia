import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AccessTokenPayload {
  userId: number;
  role?: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.accessTokenExpiry });
}
export const generateEmailToken = (userId: number) => {
  return jwt.sign(
    { userId, type: 'email_verification' },
    config.jwt.secret,
    { expiresIn: config.jwt.emailTokenExpiry }
  );
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    return null;
  }
};

export const verifyEmailToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwt.secret) as any;
  } catch {
    return null;
  }
};