import { Request, Response } from "express";
import * as challengeService from "../services/challenge.service";
import { asyncHandler } from '../utils/asyncHandler';
import { sendPaginatedSuccess, sendSuccess, sendError, createPaginationMeta } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, description, points_reward, material_type } = req.body;
  const challenge = await challengeService.createChallenge({
    title,
    description,
    points_reward,
    material_type,
    created_by_admin_id: req.user!.userId
  });
  sendSuccess(res, challenge, 'Challenge created successfully', 201);
});

export const generateChallenge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const challenge = await challengeService.generateAndSaveChallenge(req.user!.userId);
  sendSuccess(res, challenge, 'Challenge generated successfully', 201);
});

export const getAllChallenges = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  
  const result = await challengeService.getAllChallenges(page, limit);
  const meta = createPaginationMeta(result.meta.total, page, limit);
  
  sendPaginatedSuccess(res, result.data, meta, 'Challenges retrieved successfully');
});

export const getChallengeById = asyncHandler(async (req: Request, res: Response) => {
  const challengeId = Number(req.params.challengeId);
  
  if (!challengeId || challengeId <= 0) {
    return sendError(res, 'Invalid challenge ID', 400);
  }
  
  const challenge = await challengeService.getChallengeById(challengeId);
  sendSuccess(res, challenge, 'Challenge retrieved successfully');
});