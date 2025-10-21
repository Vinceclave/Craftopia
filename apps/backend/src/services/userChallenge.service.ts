// apps/backend/src/services/userChallenge.service.ts - REFACTORED VERSION
import prisma from "../config/prisma";
import { ChallengeStatus, VerificationType } from "../generated/prisma";
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError, ConflictError } from "../utils/error";
import { logger } from "../utils/logger";
import { verifyChallengeAI } from "../ai/services/image.service";

class UserChallengeService extends BaseService {
  // Join challenge
  async joinChallenge(userId: number, challengeId: number) {
    this.validateId(userId, 'User ID');
    this.validateId(challengeId, 'Challenge ID');

    logger.info('User joining challenge', { userId, challengeId });

    return await this.executeTransaction(async (tx) => {
      // Check if challenge exists and is active
      const challenge = await tx.ecoChallenge.findFirst({
        where: { 
          challenge_id: challengeId,
          is_active: true,
          deleted_at: null
        }
      });

      if (!challenge) {
        throw new NotFoundError('Challenge');
      }

      // Check if user already joined
      const existing = await tx.userChallenge.findFirst({
        where: { 
          user_id: userId, 
          challenge_id: challengeId,
          deleted_at: null
        }
      });

      if (existing) {
        throw new ConflictError('You have already joined this challenge');
      }

      const userChallenge = await tx.userChallenge.create({
        data: {
          user_id: userId,
          challenge_id: challengeId,
          status: ChallengeStatus.in_progress
        },
        include: {
          challenge: {
            select: {
              challenge_id: true,
              title: true,
              description: true,
              points_reward: true,
              material_type: true
            }
          }
        }
      });

      logger.info('User joined challenge successfully', { 
        userId, 
        challengeId,
        userChallengeId: userChallenge.user_challenge_id 
      });

      return userChallenge;
    });
  }

  // Complete challenge (submit proof)
  async completeChallenge(userChallengeId: number, userId: number, proofUrl?: string) {
    this.validateId(userChallengeId, 'User Challenge ID');
    this.validateId(userId, 'User ID');

    if (proofUrl) {
      try {
        new URL(proofUrl);
      } catch {
        throw new ValidationError('Invalid proof URL format');
      }
    }

    logger.info('User completing challenge', { userChallengeId, userId });

    return await this.executeTransaction(async (tx) => {
      const userChallenge = await tx.userChallenge.findFirst({
        where: { 
          user_challenge_id: userChallengeId,
          user_id: userId,
          deleted_at: null
        },
        include: { challenge: true }
      });

      if (!userChallenge) {
        throw new NotFoundError('User challenge');
      }

      if (userChallenge.status === ChallengeStatus.completed) {
        throw new ValidationError('Challenge is already marked as completed');
      }

      if (userChallenge.status === ChallengeStatus.rejected) {
        throw new ValidationError('This challenge was rejected. Please start a new attempt.');
      }

      const updated = await tx.userChallenge.update({
        where: { user_challenge_id: userChallengeId },
        data: {
          status: ChallengeStatus.pending_verification,
          completed_at: new Date(),
          proof_url: proofUrl?.trim() || null
        },
        include: {
          challenge: true,
          user: {
            select: { user_id: true, username: true, email: true }
          }
        }
      });

      logger.info('Challenge marked as pending verification', { 
        userChallengeId,
        userId 
      });

      return updated;
    });
  }

  // Verify challenge (AI or manual)
  async verifyChallenge(
    userChallengeId: number,
    imageUri: string,
    description: string,
    points: number,
    challengeId: number,
    userId: number
  ) {
    this.validateId(userChallengeId, 'User Challenge ID');
    this.validateId(userId, 'User ID');
    this.validateRequiredString(description, 'Challenge description', 1, 500);

    if (points <= 0) {
      throw new ValidationError('Points must be greater than 0');
    }

    logger.info('Starting AI challenge verification', { 
      userChallengeId, 
      userId,
      challengeId 
    });

    // Step 1: Run AI verification
    const aiVerification = await verifyChallengeAI(
      description, 
      imageUri, 
      points, 
      userId
    );

    const { 
      status, 
      points_awarded, 
      ai_confidence_score, 
      verification_type, 
      admin_notes, 
      completed_at, 
      verified_at
    } = aiVerification;

    logger.info('AI verification completed', { 
      userChallengeId,
      status,
      confidence: ai_confidence_score 
    });

    // Step 2: Update userChallenge
    const verified = await prisma.userChallenge.update({
      where: { user_challenge_id: userChallengeId },
      data: {
        status,
        proof_url: imageUri,
        verified_at,
        points_awarded,
        ai_confidence_score,
        verification_type,
        admin_notes,
        completed_at,
        user_id: userId,
        challenge_id: challengeId
      },
      include: {
        challenge: true,
        user: {
          select: { user_id: true, username: true, email: true }
        },
        verified_by: {
          select: { user_id: true, username: true }
        }
      }
    });

    // Step 3: Increment user score if completed
    if (status === 'completed' && points_awarded) {
      await prisma.userProfile.upsert({
        where: { user_id: userId },
        update: {
          points: { increment: points_awarded }
        },
        create: {
          user_id: userId,
          points: points_awarded
        }
      });

      logger.info('User points awarded', { 
        userId, 
        pointsAwarded: points_awarded 
      });
    }

    return verified;
  }

  // Get user challenges
  async getUserChallenges(userId: number, status?: ChallengeStatus) {
    this.validateId(userId, 'User ID');

    if (status) {
      this.validateEnum(status, ChallengeStatus, 'status');
    }

    logger.debug('Fetching user challenges', { userId, status });

    const where: any = { 
      user_id: userId,
      deleted_at: null
    };

    if (status) {
      where.status = status;
    }

    const challenges = await prisma.userChallenge.findMany({
      where,
      include: { 
        challenge: {
          include: {
            created_by_admin: {
              select: { user_id: true, username: true }
            }
          }
        },
        verified_by: {
          select: { user_id: true, username: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return challenges;
  }

  // Get user challenge by ID
  async getUserChallengeById(userId: number, challengeId: number) {
    this.validateId(userId, 'User ID');
    this.validateId(challengeId, 'Challenge ID');

    logger.debug('Fetching user challenge', { userId, challengeId });

    const userChallenge = await prisma.userChallenge.findUnique({
      where: {
        user_id_challenge_id: {
          user_id: userId,
          challenge_id: challengeId
        }
      },
      include: {
        challenge: {
          include: {
            created_by_admin: {
              select: { user_id: true, username: true }
            }
          }
        },
        verified_by: {
          select: { user_id: true, username: true }
        }
      }
    });

    if (!userChallenge || userChallenge.deleted_at) {
      throw new NotFoundError('User challenge');
    }

    // Check if challenge expired and auto-reject
    const now = new Date();
    if (userChallenge.challenge.expires_at && 
        userChallenge.challenge.expires_at < now &&
        userChallenge.status !== ChallengeStatus.rejected) {
      
      await prisma.userChallenge.update({
        where: {
          user_id_challenge_id: {
            user_id: userId,
            challenge_id: challengeId
          }
        },
        data: { status: ChallengeStatus.rejected }
      });

      userChallenge.status = ChallengeStatus.rejected;
      
      logger.info('Auto-rejected expired challenge', { 
        userId, 
        challengeId 
      });
    }

    return userChallenge;
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId?: number, limit: number = 10) {
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    if (challengeId) {
      this.validateId(challengeId, 'Challenge ID');
    }

    logger.debug('Fetching challenge leaderboard', { challengeId, limit });

    const where: any = {
      status: ChallengeStatus.completed,
      deleted_at: null,
      verified_at: { not: null }
    };

    if (challengeId) {
      where.challenge_id = challengeId;
    }

    return prisma.userChallenge.findMany({
      where,
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            profile: {
              select: {
                points: true,
                profile_picture_url: true
              }
            }
          }
        },
        challenge: {
          select: {
            title: true,
            points_reward: true,
            material_type: true
          }
        }
      },
      orderBy: [
        { verified_at: 'asc' },
        { completed_at: 'asc' }
      ],
      take: limit
    });
  }

  // Get pending verifications (Admin)
  async getPendingVerifications(page: number = 1, limit: number = 20) {
    logger.debug('Fetching pending verifications', { page, limit });

    return this.paginate(prisma.userChallenge, {
      page,
      limit,
      where: {
        status: ChallengeStatus.pending_verification,
        verified_at: null,
        deleted_at: null
      },
      orderBy: { completed_at: 'asc' }
    });
  }

  // Manually verify challenge (Admin)
  async manualVerify(
    userChallengeId: number,
    adminId: number,
    approved: boolean,
    notes?: string
  ) {
    this.validateId(userChallengeId, 'User Challenge ID');
    this.validateId(adminId, 'Admin ID');

    logger.info('Manual verification by admin', { 
      userChallengeId, 
      adminId, 
      approved 
    });

    return await this.executeTransaction(async (tx) => {
      const userChallenge = await tx.userChallenge.findFirst({
        where: { 
          user_challenge_id: userChallengeId,
          deleted_at: null
        },
        include: { challenge: true }
      });

      if (!userChallenge) {
        throw new NotFoundError('User challenge');
      }

      const status = approved ? ChallengeStatus.completed : ChallengeStatus.rejected;
      const pointsAwarded = approved ? userChallenge.challenge.points_reward : 0;

      const updated = await tx.userChallenge.update({
        where: { user_challenge_id: userChallengeId },
        data: {
          status,
          verified_by_admin_id: adminId,
          verified_at: new Date(),
          verification_type: VerificationType.manual,
          points_awarded: pointsAwarded,
          admin_notes: notes?.trim() || null
        },
        include: {
          challenge: true,
          user: {
            select: { user_id: true, username: true, email: true }
          },
          verified_by: {
            select: { user_id: true, username: true }
          }
        }
      });

      // Award points if approved
      if (approved && pointsAwarded > 0) {
        await tx.userProfile.upsert({
          where: { user_id: userChallenge.user_id },
          update: {
            points: { increment: pointsAwarded }
          },
          create: {
            user_id: userChallenge.user_id,
            points: pointsAwarded
          }
        });

        logger.info('Points awarded via manual verification', { 
          userId: userChallenge.user_id, 
          points: pointsAwarded 
        });
      }

      return updated;
    });
  }

  // Get user challenge statistics
  async getUserChallengeStats(userId: number) {
    this.validateId(userId, 'User ID');

    const [total, inProgress, pending, completed, rejected] = await Promise.all([
      prisma.userChallenge.count({
        where: { user_id: userId, deleted_at: null }
      }),
      prisma.userChallenge.count({
        where: { 
          user_id: userId, 
          status: ChallengeStatus.in_progress,
          deleted_at: null 
        }
      }),
      prisma.userChallenge.count({
        where: { 
          user_id: userId, 
          status: ChallengeStatus.pending_verification,
          deleted_at: null 
        }
      }),
      prisma.userChallenge.count({
        where: { 
          user_id: userId, 
          status: ChallengeStatus.completed,
          deleted_at: null 
        }
      }),
      prisma.userChallenge.count({
        where: { 
          user_id: userId, 
          status: ChallengeStatus.rejected,
          deleted_at: null 
        }
      })
    ]);

    const totalPoints = await prisma.userChallenge.aggregate({
      where: { 
        user_id: userId, 
        status: ChallengeStatus.completed,
        deleted_at: null 
      },
      _sum: { points_awarded: true }
    });

    return {
      total,
      inProgress,
      pending,
      completed,
      rejected,
      totalPointsEarned: totalPoints._sum.points_awarded || 0
    };
  }
}

// Export singleton instance
export const userChallengeService = new UserChallengeService();

// Export individual functions for backward compatibility
export const joinChallenge = userChallengeService.joinChallenge.bind(userChallengeService);
export const completeChallenge = userChallengeService.completeChallenge.bind(userChallengeService);
export const verifyChallenge = userChallengeService.verifyChallenge.bind(userChallengeService);
export const getUserChallenges = userChallengeService.getUserChallenges.bind(userChallengeService);
export const getUserChallengeById = userChallengeService.getUserChallengeById.bind(userChallengeService);
export const getChallengeLeaderboard = userChallengeService.getChallengeLeaderboard.bind(userChallengeService);
export const getPendingVerifications = userChallengeService.getPendingVerifications.bind(userChallengeService);
export const manualVerify = userChallengeService.manualVerify.bind(userChallengeService);
export const getUserChallengeStats = userChallengeService.getUserChallengeStats.bind(userChallengeService);