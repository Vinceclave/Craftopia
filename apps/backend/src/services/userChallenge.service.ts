import prisma from "../config/prisma";
import { ChallengeStatus } from "../generated/prisma";
import { AppError } from "../utils/error"; // Fixed import path

export const joinChallenge = async (user_id: number, challenge_id: number) => {
  if (!user_id || user_id <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  if (!challenge_id || challenge_id <= 0) {
    throw new AppError('Invalid challenge ID', 400);
  }

  // Check if challenge exists and is active
  const challenge = await prisma.ecoChallenge.findFirst({
    where: { 
      challenge_id,
      is_active: true,
      deleted_at: null
    }
  });

  if (!challenge) {
    throw new AppError('Challenge not found or inactive', 404);
  }

  // Check if user already joined this challenge
  const existing = await prisma.userChallenge.findFirst({
    where: { 
      user_id, 
      challenge_id,
      deleted_at: null
    }
  });

  if (existing) {
    throw new AppError('You have already joined this challenge', 400);
  }

  return prisma.userChallenge.create({
    data: {
      user_id,
      challenge_id,
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
};

export const completeChallenge = async (userChallengeId: number, userId: number, proofUrl?: string) => {
  if (!userChallengeId || userChallengeId <= 0) {
    throw new AppError('Invalid user challenge ID', 400);
  }

  const userChallenge = await prisma.userChallenge.findFirst({
    where: { 
      user_challenge_id: userChallengeId,
      user_id: userId,
      deleted_at: null
    },
    include: {
      challenge: true
    }
  });

  if (!userChallenge) {
    throw new AppError('User challenge not found', 404);
  }

  if (userChallenge.status === ChallengeStatus.completed) {
    throw new AppError('Challenge is already marked as completed', 400);
  }

  if (userChallenge.status === ChallengeStatus.rejected) {
    throw new AppError('This challenge was rejected. Please start a new attempt.', 400);
  }

  return prisma.userChallenge.update({
    where: { user_challenge_id: userChallengeId },
    data: {
      status: ChallengeStatus.completed,
      completed_at: new Date(),
      proof_url: proofUrl || null
    },
    include: {
      challenge: true,
      user: {
        select: { user_id: true, username: true, email: true }
      }
    }
  });
};

export const verifyChallenge = async (
  userChallengeId: number, 
  adminId: number, 
  approved: boolean = true,
  adminNotes?: string
) => {
  if (!userChallengeId || userChallengeId <= 0) {
    throw new AppError('Invalid user challenge ID', 400);
  }

  const userChallenge = await prisma.userChallenge.findFirst({
    where: { 
      user_challenge_id: userChallengeId,
      deleted_at: null
    },
    include: { 
      challenge: true,
      user: {
        include: {
          profile: true
        }
      }
    }
  });

  if (!userChallenge) {
    throw new AppError('User challenge not found', 404);
  }

  if (userChallenge.status !== ChallengeStatus.completed) {
    throw new AppError('Challenge must be completed before verification', 400);
  }

  const newStatus = approved ? ChallengeStatus.completed : ChallengeStatus.rejected;
  const pointsToAward = approved ? userChallenge.challenge.points_reward : 0;

  // Use transaction to update challenge and user points atomically
  return prisma.$transaction(async (tx) => {
    // Update the user challenge
    const updatedChallenge = await tx.userChallenge.update({
      where: { user_challenge_id: userChallengeId },
      data: {
        status: newStatus,
        verified_at: new Date(),
        verified_by_admin_id: adminId,
        points_awarded: pointsToAward
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

    // If approved, award points to user
    if (approved && pointsToAward > 0) {
      await tx.userProfile.upsert({
        where: { user_id: userChallenge.user_id },
        create: {
          user_id: userChallenge.user_id,
          points: pointsToAward
        },
        update: {
          points: {
            increment: pointsToAward
          }
        }
      });
    }

    return updatedChallenge;
  });
};

export const getUserChallenges = async (user_id: number, status?: ChallengeStatus) => {
  if (!user_id || user_id <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  const where: any = { 
    user_id,
    deleted_at: null
  };

  if (status) {
    where.status = status;
  }

  return prisma.userChallenge.findMany({
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
};

export const getChallengeLeaderboard = async (challengeId?: number, limit: number = 10) => {
  const where: any = {
    status: ChallengeStatus.completed,
    deleted_at: null
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
      { verified_at: 'asc' }, // Earlier completions rank higher
      { completed_at: 'asc' }
    ],
    take: limit
  });
};

export const getPendingVerifications = async (page: number = 1, limit: number = 20) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 20;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.userChallenge.findMany({
      where: {
        status: ChallengeStatus.completed,
        deleted_at: null
      },
      skip,
      take: limit,
      include: {
        user: {
          select: { user_id: true, username: true, email: true }
        },
        challenge: {
          select: {
            challenge_id: true,
            title: true,
            description: true,
            points_reward: true,
            material_type: true
          }
        }
      },
      orderBy: { completed_at: 'asc' } // Oldest first
    }),
    prisma.userChallenge.count({
      where: {
        status: ChallengeStatus.completed,
        deleted_at: null
      }
    })
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      limit
    }
  };
};