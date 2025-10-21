import * as userChallengeService from "../services/userChallenge.service";
import { sendSuccess,sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from "express";

export const joinChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { challenge_id } = req.body;
  
  const userChallenge = await userChallengeService.joinChallenge(
    req.user!.userId,
    challenge_id
  );
  
  sendSuccess(res, userChallenge, 'Successfully joined challenge', 201);
});

export const completeChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userChallengeId = Number(req.params.userChallengeId);
  const { proof_url } = req.body;
  
  const updated = await userChallengeService.completeChallenge(
    userChallengeId,
    req.user!.userId,
    proof_url
  );
  
  sendSuccess(res, updated, 'Challenge marked as completed. Awaiting verification.');
});

export const verifyChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userChallengeId = Number(req.params.userChallengeId);
  const { proof_url, description, points, challenge_id, userId } = req.body;

  const updated = await userChallengeService.verifyChallenge(
    userChallengeId,
    proof_url,
    description,
    points,
    challenge_id,
    userId
  );
  
  sendSuccess(res, updated, 'Challenge verification completed');
});

export const getUserChallenges = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId) || req.user!.userId;
  const status = req.query.status as any;
  
  const challenges = await userChallengeService.getUserChallenges(userId, status);
  sendSuccess(res, challenges, 'User challenges retrieved successfully');
});

export const getUserChallengeById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const challengeId = Number(req.params.challengeId);

  const challenge = await userChallengeService.getUserChallengeById(userId, challengeId);
  sendSuccess(res, challenge, "User challenge retrieved successfully");
});

export const getChallengeLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const challengeId = req.query.challengeId ? Number(req.query.challengeId) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  
  const leaderboard = await userChallengeService.getChallengeLeaderboard(challengeId, limit);
  sendSuccess(res, leaderboard, 'Leaderboard retrieved successfully');
});

export const getPendingVerifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  
  const result = await userChallengeService.getPendingVerifications(page, limit);
  sendPaginatedSuccess(res, result.data, result.meta, 'Pending verifications retrieved');
});

export const manualVerify = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userChallengeId = Number(req.params.userChallengeId);
  const adminId = req.user!.userId;
  const { approved, notes } = req.body;
  
  const result = await userChallengeService.manualVerify(
    userChallengeId,
    adminId,
    approved,
    notes
  );
  
  sendSuccess(res, result, 'Challenge manually verified');
});