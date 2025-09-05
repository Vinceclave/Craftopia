import prisma from "../config/prisma";
import { ChallengeStatus } from "../generated/prisma";

// User joins a challenge
export const joinChallenge = async (user_id: number, challenge_id: number) => {
  return prisma.userChallenge.create({
    data: {
      user_id,
      challenge_id,
      status: ChallengeStatus.in_progress
    }
  });
};

// Update challenge status (complete/verify)
export const updateUserChallengeStatus = async (
  userChallengeId: number,
  status: ChallengeStatus
) => {
  return prisma.userChallenge.update({
    where: { user_challenge_id: userChallengeId },
    data: {
      status,
      completed_at: status === ChallengeStatus.completed ? new Date() : null
    }
  });
};

// Get challenges for a user
export const getUserChallenges = async (user_id: number) => {
  return prisma.userChallenge.findMany({
    where: { user_id },
    include: { challenge: true }
  });
};
