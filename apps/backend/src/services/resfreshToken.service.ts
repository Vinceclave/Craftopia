import { prisma } from "../config/prisma";
import { hashToken, compareToken } from "../utils/hash";
import { addDays } from 'date-fns';

export const createRefreshToken = async (userId: number, rawToken: string) => {
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
    if (!rawToken) return null;
    
    const tokens = await prisma.refreshToken.findMany({
        where: {
            expires_at: {
                gt: new Date() // Only get non-expired tokens
            }
        }
    });

    for (const t of tokens) {
        const match = await compareToken(rawToken, t.token_hash);
        if (match) return t;
    }
    return null;
}

export const revokeRefreshToken = async (tokenIdOrRawToken: number | string) => {
    if (typeof tokenIdOrRawToken === 'number') {
        // Revoke by token ID
        await prisma.refreshToken.delete({ 
            where: { token_id: tokenIdOrRawToken }
        });
    } else {
        // Revoke by raw token (for logout)
        const storedToken = await verifyRefreshToken(tokenIdOrRawToken);
        if (storedToken) {
            await prisma.refreshToken.delete({ 
                where: { token_id: storedToken.token_id }
            });
        }
    }
}