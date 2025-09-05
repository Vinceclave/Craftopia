import * as jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  userId: number;
  role?: string;
}

export interface EmailTokenPayload {
  userId: number;
  type: string;
}

// Get JWT secret from environment with fallback
const getJWTSecret = (): string => process.env.JWT_SECRET || 'craftopia-fallback-secret-dev-only';

// Use `StringValue` from jsonwebtoken types
type JWTExpiresIn = jwt.SignOptions['expiresIn'];

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const secret = getJWTSecret();
  const expiresIn: JWTExpiresIn = (process.env.JWT_EXPIRES_IN as JWTExpiresIn) || '15m';

  const tokenPayload = {
    userId: payload.userId,
    role: payload.role || 'user',
  };

  return jwt.sign(tokenPayload, secret, { expiresIn });
};

export const generateEmailToken = (userId: number): string => {
  const secret = getJWTSecret();
  const expiresIn: JWTExpiresIn = '24h';

  const tokenPayload = {
    userId,
    type: 'email_verification',
  };

  return jwt.sign(tokenPayload, secret, { expiresIn });
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
      return {
        userId: decoded.userId as number,
        role: (decoded.role as string) || 'user',
      };
    }

    return null;
  } catch {
    return null;
  }
};

export const verifyEmailToken = (token: string): EmailTokenPayload | null => {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (decoded && typeof decoded === 'object' && 'userId' in decoded && 'type' in decoded) {
      return {
        userId: decoded.userId as number,
        type: decoded.type as string,
      };
    }

    return null;
  } catch {
    return null;
  }
};
