import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '15m'; // Access token expiry

export const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateEmailToken = (userId: number) => {
    return jwt.sign(
        { userId, type: 'email_verification' }, // must match verification check
        JWT_SECRET,
        { expiresIn: '1d' } // 24 hours
    );
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

export const verifyEmailToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as any;
    } catch {
        return null;
    }
};
