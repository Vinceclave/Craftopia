import crypto from 'crypto';
import { prisma } from '@/config/prisma';
import { User } from '@prisma/client';
import { signToken } from './jwt';
import { create } from 'domain';

export function generateVerificationToken () {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex'); // hashed
    return {token, tokenHash };
}

export const createRefreshToken =  async (userId: number, hoursValid = 24 * 7) => {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * hoursValid);

    await prisma.refreshToken.create({
        data: {
            user_id: userId,
            token_hash: token,
            expires_at: expiresAt
        }
    })

    return token;
}

export const generateTokens = async (user: User) => {
    const token = signToken(user);

    const refreshToken = await createRefreshToken(user.id);

    return { token, refreshToken};
}

export const refreshJWT = async (refreshToken: string) => {
    const record = await prisma.refreshToken.findUnique({
        where: { token_hash: refreshToken }
    })

    if (!record || record.expires_at < new Date()) throw new Error('Refresh token invalid or expired');

    const user = await prisma.user.findUnique({ where: { id: record.user_id }});
    if (!user) throw new Error('User not found');

    await prisma.refreshToken.delete({ where: {  token_hash: refreshToken }});
    const newRefreshToken = await createRefreshToken(user.id);
    const token = signToken(user);

    return { token, refreshToken: newRefreshToken};

}