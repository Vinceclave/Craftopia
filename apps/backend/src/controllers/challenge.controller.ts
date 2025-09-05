import { Request, Response } from "express";
import * as challengeService from "../services/challenge.service";
import { asyncHandler } from '../utils/asyncHandler';
import { sendPaginatedSuccess, sendSuccess } from '../utils/response';
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
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await challengeService.getAllChallenges(page, limit);
  sendPaginatedSuccess(res, result.data, result.meta, 'Challenges retrieved successfully');
});

export const getChallengeById = asyncHandler(async (req: Request, res: Response) => {
  const challengeId = Number(req.params.challengeId);
  const challenge = await challengeService.getChallengeById(challengeId);
  sendSuccess(res, challenge, 'Challenge retrieved successfully');
});