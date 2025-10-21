import prisma from "../config/prisma";
import { hashToken, compareToken } from "../utils/hash";
import { addDays } from 'date-fns';
import { BaseService } from "./base.service";
import { ValidationError } from '../utils/error';
import { logger } from "../utils/logger";
import { TOKEN_EXPIRY } from "../constats";

class RefreshTokenService extends BaseService {
  // Create refresh token
  async createRefreshToken(userId: number, rawToken: string) {
    this.validateId(userId, 'User ID');

    if (!rawToken?.trim()) {
      throw new ValidationError('Token is required');
    }

    logger.debug('Creating refresh token', { userId });

    const tokenHash = await hashToken(rawToken);
    const expiredAt = addDays(new Date(), TOKEN_EXPIRY.REFRESH_TOKEN_DAYS);

    return prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiredAt,
      },
    });
  }

  // Verify refresh token
  async verifyRefreshToken(rawToken: string) {
    if (!rawToken?.trim()) return null;

    logger.debug('Verifying refresh token');

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
        if (match) {
          logger.debug('Refresh token verified', { tokenId: t.token_id });
          return t;
        }
      } catch (error) {
        continue;
      }
    }

    logger.warn('Invalid refresh token');
    return null;
  }

  // Revoke refresh token
  async revokeRefreshToken(tokenIdOrRawToken: number | string) {
    try {
      if (typeof tokenIdOrRawToken === 'number') {
        logger.debug('Revoking refresh token by ID', { tokenId: tokenIdOrRawToken });
        await prisma.refreshToken.delete({
          where: { token_id: tokenIdOrRawToken }
        });
      } else {
        const storedToken = await this.verifyRefreshToken(tokenIdOrRawToken);
        if (storedToken) {
          logger.debug('Revoking refresh token', { tokenId: storedToken.token_id });
          await prisma.refreshToken.delete({
            where: { token_id: storedToken.token_id }
          });
        }
      }
    } catch (error) {
      logger.warn('Error revoking token (may already be deleted)', error);
    }
  }

  // Cleanup old tokens
  async cleanupOldTokens() {
    logger.info('Starting refresh token cleanup');

    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: new Date() } },
          {
            last_used: {
              lt: new Date(Date.now() - 60 * 60 * 1000)
            }
          }
        ]
      }
    });

    logger.info('Refresh token cleanup completed', { deletedCount: result.count });

    return result;
  }

  // Get user's active tokens
  async getUserTokens(userId: number) {
    this.validateId(userId, 'User ID');

    return prisma.refreshToken.findMany({
      where: {
        user_id: userId,
        expires_at: { gt: new Date() }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  // Revoke all user tokens (logout from all devices)
  async revokeAllUserTokens(userId: number) {
    this.validateId(userId, 'User ID');

    logger.info('Revoking all user tokens', { userId });

    const result = await prisma.refreshToken.deleteMany({
      where: { user_id: userId }
    });

    logger.info('All user tokens revoked', { userId, count: result.count });

    return result;
  }
}

// Export singleton instance
export const refreshTokenService = new RefreshTokenService();

// Export individual functions for backward compatibility
export const createRefreshToken = refreshTokenService.createRefreshToken.bind(refreshTokenService);
export const verifyRefreshToken = refreshTokenService.verifyRefreshToken.bind(refreshTokenService);
export const revokeRefreshToken = refreshTokenService.revokeRefreshToken.bind(refreshTokenService);
export const cleanupOldTokens = refreshTokenService.cleanupOldTokens.bind(refreshTokenService);
export const getUserTokens = refreshTokenService.getUserTokens.bind(refreshTokenService);
export const revokeAllUserTokens = refreshTokenService.revokeAllUserTokens.bind(refreshTokenService);
