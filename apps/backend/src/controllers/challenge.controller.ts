import { Request, Response } from "express";
import * as challengeService from "../services/challenge.service";
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const challenge = await challengeService.createChallenge({
    ...req.body,
    created_by_admin_id: req.user!.userId
  });
  
  sendSuccess(res, challenge, 'Challenge created successfully', 201);
});

export const generateChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category } = req.body;
  
  const challenge = await challengeService.generateAndSaveChallenge(
    category,
    req.user!.userId
  );
  
  sendSuccess(res, challenge, 'Challenge generated successfully', 201);
});

export const getAllChallenges = asyncHandler(async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const result = await challengeService.getAllChallenges(category);
  
  sendSuccess(res, result.data, 'Challenges retrieved successfully');
});

export const getChallengeById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const challengeId = Number(req.params.challengeId);
  const userId = req.user?.userId;
  
  const challenge = await challengeService.getChallengeById(challengeId, userId);
  sendSuccess(res, challenge, 'Challenge retrieved successfully');
});

export const updateChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const challengeId = Number(req.params.challengeId);
  
  const challenge = await challengeService.updateChallenge(challengeId, req.body);
  sendSuccess(res, challenge, 'Challenge updated successfully');
});

export const deleteChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const challengeId = Number(req.params.challengeId);
  
  await challengeService.deleteChallenge(challengeId);
  sendSuccess(res, null, 'Challenge deleted successfully');
});

// ============================================
// USER CHALLENGE CONTROLLER - REFACTORED
// ============================================
// apps/backend/src/controllers/userChallenge.controller.ts
import * as userChallengeService from "../services/userChallenge.service";
import { sendPaginatedSuccess } from '../utils/response';

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