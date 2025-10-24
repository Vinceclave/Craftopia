// apps/backend/src/services/userChallenge.service.ts - REFACTORED VERSION
import prisma from "../config/prisma";
import { ChallengeStatus, VerificationType } from "../generated/prisma";
import { BaseService } from "./base.service";
import { ValidationError, NotFoundError, ConflictError } from "../utils/error";
import { logger } from "../utils/logger";
import { verifyChallengeAI } from "../ai/services/image.service";
import { WebSocketEmitter } from '../websocket/events';


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

      // 🔥 WEBSOCKET: Notify user they joined
      WebSocketEmitter.challengeJoined(userId, {
        challenge: userChallenge.challenge,
        userChallengeId: userChallenge.user_challenge_id,
        status: userChallenge.status
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

       // 🔥 WEBSOCKET: Notify user and admins
      WebSocketEmitter.challengeCompleted(userId, {
        userChallengeId: updated.user_challenge_id,
        challenge: updated.challenge,
        status: updated.status,
        completedAt: updated.completed_at
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

  // Get challenge details including waste_kg
  const challenge = await prisma.ecoChallenge.findUnique({
    where: { challenge_id: challengeId },
    select: { 
      waste_kg: true, 
      points_reward: true,
      title: true,
      material_type: true
    }
  });

  if (!challenge) {
    throw new NotFoundError('Challenge');
  }

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

  // Calculate waste saved based on verification status
  const wasteKgSaved = status === 'completed' ? challenge.waste_kg : 0;

  // Step 2: Update userChallenge
  const verified = await prisma.userChallenge.update({
    where: { user_challenge_id: userChallengeId },
    data: {
      status,
      proof_url: imageUri,
      verified_at,
      points_awarded,
      waste_kg_saved: wasteKgSaved, // ✅ NEW FIELD
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

  // Step 3: Increment user score AND waste_kg if completed
  if (status === 'completed' && points_awarded > 0) {
    await prisma.userProfile.upsert({
      where: { user_id: userId },
      update: {
        points: { increment: points_awarded },
        total_waste_kg: { increment: wasteKgSaved } // ✅ NEW FIELD
      },
      create: {
        user_id: userId,
        points: points_awarded,
        total_waste_kg: wasteKgSaved // ✅ NEW FIELD
      }
    });

    logger.info('User points and waste saved', { 
      userId, 
      pointsAwarded: points_awarded,
      wasteKgSaved
    });

    // Notify user of success
    WebSocketEmitter.challengeVerified(userId, {
      userChallengeId,
      challenge: verified.challenge,
      points_awarded,
      waste_kg_saved: wasteKgSaved, // ✅ INCLUDE IN NOTIFICATION
      ai_confidence_score,
      status
    });

    // Award points notification
    WebSocketEmitter.pointsAwarded(userId, {
      amount: points_awarded,
      waste_kg_saved: wasteKgSaved, // ✅ INCLUDE IN NOTIFICATION
      reason: 'Challenge completed',
      challengeTitle: verified.challenge.title
    });

    // Update leaderboard
    const leaderboard = await this.getChallengeLeaderboard(challengeId, 10);
    WebSocketEmitter.leaderboardUpdated({
      challengeId,
      leaderboard
    });
  } else if (status === 'rejected') {
    // Notify user of rejection
    WebSocketEmitter.challengeRejected(userId, {
      userChallengeId,
      challenge: verified.challenge,
      admin_notes,
      ai_confidence_score
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
    const wasteKgSaved = approved ? userChallenge.challenge.waste_kg : 0; // ✅ NEW

    const updated = await tx.userChallenge.update({
      where: { user_challenge_id: userChallengeId },
      data: {
        status,
        verified_by_admin_id: adminId,
        verified_at: new Date(),
        verification_type: VerificationType.manual,
        points_awarded: pointsAwarded,
        waste_kg_saved: wasteKgSaved, // ✅ NEW FIELD
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

    // Award points and waste_kg if approved
    if (approved && pointsAwarded > 0) {
      await tx.userProfile.upsert({
        where: { user_id: userChallenge.user_id },
        update: {
          points: { increment: pointsAwarded },
          total_waste_kg: { increment: wasteKgSaved } // ✅ NEW FIELD
        },
        create: {
          user_id: userChallenge.user_id,
          points: pointsAwarded,
          total_waste_kg: wasteKgSaved // ✅ NEW FIELD
        }
      });

      logger.info('Points and waste awarded via manual verification', { 
        userId: userChallenge.user_id, 
        points: pointsAwarded,
        wasteKg: wasteKgSaved
      });

      WebSocketEmitter.challengeVerified(userChallenge.user_id, {
        userChallengeId,
        challenge: updated.challenge,
        points_awarded: pointsAwarded,
        waste_kg_saved: wasteKgSaved, // ✅ INCLUDE IN NOTIFICATION
        status,
        verifiedBy: updated.verified_by?.username,
        admin_notes: notes
      });
      
      WebSocketEmitter.pointsAwarded(userChallenge.user_id, {
        amount: pointsAwarded,
        waste_kg_saved: wasteKgSaved, // ✅ INCLUDE IN NOTIFICATION
        reason: 'Challenge manually approved',
        challengeTitle: updated.challenge.title
      });

      // Update leaderboard
      const leaderboard = await this.getChallengeLeaderboard(
        userChallenge.challenge_id, 
        10
      );
      WebSocketEmitter.leaderboardUpdated({
        challengeId: userChallenge.challenge_id,
        leaderboard
      });
    } else {
      // Rejection notification
      WebSocketEmitter.challengeRejected(userChallenge.user_id, {
        userChallengeId,
        challenge: updated.challenge,
        admin_notes: notes,
        verifiedBy: updated.verified_by?.username
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
  /**
   * Skip a challenge (soft delete with skip tracking)
   */
  async skipChallenge(
    userChallengeId: number,
    userId: number,
    reason?: string
  ) {
    this.validateId(userChallengeId, 'User Challenge ID');
    this.validateId(userId, 'User ID');

    logger.info('User skipping challenge', { userChallengeId, userId, reason });

    return await this.executeTransaction(async (tx) => {
      // Verify ownership and status
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

      // Can only skip if in_progress
      if (userChallenge.status !== ChallengeStatus.in_progress) {
        throw new ValidationError(
          'Can only skip challenges that are in progress'
        );
      }

      // Mark as skipped (soft delete + skip timestamp)
      await tx.userChallenge.update({
        where: { user_challenge_id: userChallengeId },
        data: {
          deleted_at: new Date(),
          skipped_at: new Date(),
          admin_notes: reason ? `Skipped: ${reason}` : 'Skipped by user'
        }
      });

      logger.info('Challenge skipped successfully', {
        userChallengeId,
        userId,
        challengeTitle: userChallenge.challenge.title
      });

      // Notify user via WebSocket
      WebSocketEmitter.notification(userId, {
        type: 'challenge_skipped',
        title: 'Challenge Skipped',
        message: 'No worries! Try another challenge that fits your schedule.',
        data: {
          challengeId: userChallenge.challenge_id,
          challengeTitle: userChallenge.challenge.title
        }
      });

      return {
        message: 'Challenge skipped. Try a different one!',
        skippedChallenge: {
          challenge_id: userChallenge.challenge_id,
          title: userChallenge.challenge.title
        }
      };
    });
  }

  /**
   * Get user's waste statistics
   */
  async getUserWasteStats(userId: number) {
  this.validateId(userId, 'User ID');

  const profile = await prisma.userProfile.findUnique({
    where: { user_id: userId },
    select: { total_waste_kg: true, points: true }
  });

  const completedChallenges = await prisma.userChallenge.findMany({
    where: {
      user_id: userId,
      status: ChallengeStatus.completed,
      deleted_at: null
    },
    include: {
      challenge: {
        select: {
          title: true,
          waste_kg: true,
          material_type: true
        }
      }
    }
  });

  // Calculate waste by material type
  const wasteByMaterial = completedChallenges.reduce((acc, uc) => {
    const material = uc.challenge.material_type;
    acc[material] = (acc[material] || 0) + uc.waste_kg_saved;
    return acc;
  }, {} as Record<string, number>);

  // Recent contributions
  const recentContributions = completedChallenges.slice(0, 5).map(uc => ({
    challenge_title: uc.challenge.title,
    waste_kg: uc.waste_kg_saved,
    material_type: uc.challenge.material_type,
    verified_at: uc.verified_at
  }));

  return {
    total_waste_kg: profile?.total_waste_kg || 0,
    total_points: profile?.points || 0,
    completed_challenges_count: completedChallenges.length,
    waste_by_material: wasteByMaterial,
    recent_contributions: recentContributions,
    impact_equivalents: {
      plastic_bottles: Math.floor((profile?.total_waste_kg || 0) / 0.03),
      coffee_cups: Math.floor((profile?.total_waste_kg || 0) / 0.05),
      cardboard_boxes: Math.floor((profile?.total_waste_kg || 0) / 0.2),
      glass_jars: Math.floor((profile?.total_waste_kg || 0) / 0.3),
      aluminum_cans: Math.floor((profile?.total_waste_kg || 0) / 0.015),
      trees_equivalent: ((profile?.total_waste_kg || 0) * 0.05).toFixed(1)
    }
  };
}




  /**
   * Calculate real-world impact equivalents
   */
  private calculateImpactEquivalents(wasteKg: number) {
    return {
      plastic_bottles: Math.floor(wasteKg / 0.03), // 30g per bottle
      coffee_cups: Math.floor(wasteKg / 0.05), // 50g per cup
      cardboard_boxes: Math.floor(wasteKg / 0.2), // 200g per box
      glass_jars: Math.floor(wasteKg / 0.3), // 300g per jar
      aluminum_cans: Math.floor(wasteKg / 0.015), // 15g per can
      trees_equivalent: (wasteKg * 0.05).toFixed(1) // Rough estimate
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
export const skipChallenge = userChallengeService.skipChallenge.bind(userChallengeService);
export const getUserWasteStats = userChallengeService.getUserWasteStats.bind(userChallengeService);
