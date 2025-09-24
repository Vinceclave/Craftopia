import { Request, Response } from "express";
import * as challengeService from "../services/challenge.service";
import { asyncHandler } from '../utils/asyncHandler';
import { sendPaginatedSuccess, sendSuccess, sendError, createPaginationMeta } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ChallengeCategory } from '../generated/prisma';

export const createChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, points_reward, material_type, category } = req.body;
  
  const challenge = await challengeService.createChallenge({
    title,
    description,
    points_reward,
    material_type,
    category: category || 'daily', // Default to 'daily' if not provided
    created_by_admin_id: req.user!.userId
  });
  
  sendSuccess(res, challenge, 'Challenge created successfully', 201);
});

export const generateChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { category } = req.body;
  
  // Validate category if provided, default to 'daily'
  const challengeCategory: ChallengeCategory = category || 'daily';
  
  const challenge = await challengeService.generateAndSaveChallenge(challengeCategory, req.user!.userId);
  sendSuccess(res, challenge, 'Challenge generated successfully', 201);
});

export const getAllChallenges = asyncHandler(async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;

  const result = await challengeService.getAllChallenges(category);

  sendSuccess(res, result.data, 'Challenges retrieved successfully');
});

export const getChallengeById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const challengeId = Number(req.params.challengeId);
  
  if (!challengeId || challengeId <= 0) {
    return sendError(res, 'Invalid challenge ID', 400);
  }
  
  // Pass the user ID to check join status
  const userId = req.user?.userId; // Get from auth middleware
  const challenge = await challengeService.getChallengeById(challengeId, userId);
  
  sendSuccess(res, challenge, 'Challenge retrieved successfully');
});