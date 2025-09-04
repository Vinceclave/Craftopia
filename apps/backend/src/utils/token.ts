import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '15m'; // 15 minutes

export const generateAccessToken = (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateEmailToken = (userId: number) => {
    return jwt.sign(
        { userId, type: 'emailverification' },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' } // expires in 24 hours
    );
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};
