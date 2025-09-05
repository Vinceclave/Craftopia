import { Request, Response, NextFunction } from "express";
import * as userChallengeService from "../services/userChallenge.service";
import { ChallengeStatus } from "../generated/prisma";

// Join a challenge
export const joinChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, challenge_id } = req.body;

    if (!user_id || !challenge_id) {
      return res.status(400).json({ success: false, error: "user_id and challenge_id are required" });
    }

    const userChallenge = await userChallengeService.joinChallenge(user_id, challenge_id);

    res.status(201).json({ success: true, data: userChallenge });
  } catch (err) {
    next(err);
  }
};

// Complete a challenge
export const completeChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userChallengeId } = req.params;

    const updated = await userChallengeService.updateUserChallengeStatus(
      Number(userChallengeId),
      ChallengeStatus.completed
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Verify a challenge
export const verifyChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userChallengeId } = req.params;

    const updated = await userChallengeService.updateUserChallengeStatus(
      Number(userChallengeId),
      ChallengeStatus.completed
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Get all challenges for a user
export const getUserChallenges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const challenges = await userChallengeService.getUserChallenges(Number(userId));

    res.json({ success: true, data: challenges });
  } catch (err) {
    next(err);
  }
};
