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
    const tokens = await prisma.refreshToken.findMany();

    for (const t of tokens) {
        const match = await compareToken(rawToken, t.token_hash);
        if (match && t.expires_at > new Date()) return t;
    }
    return null;
}

export const revokeRefreshToken = async (tokenId: number) => {
    await prisma.refreshToken.delete({ where: { token_id: tokenId }});
}