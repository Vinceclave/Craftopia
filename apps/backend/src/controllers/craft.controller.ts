// apps/backend/src/controllers/craft.controller.ts 

import { Request, Response } from "express";
import * as craftService from '../services/craft.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createCraftIdea = asyncHandler(async (req: AuthRequest, res: Response) => {
  const craftIdea = await craftService.createCraftIdea({
    generated_by_user_id: req.user!.userId,
    ...req.body
  });
  
  sendSuccess(res, craftIdea, 'Craft idea created successfully', 201);
});

/**
 * ✅ Save craft from base64 image
 * Uploads image to S3 first, then saves to database
 * POST /api/v1/crafts/save-from-base64
 */
export const saveCraftFromBase64 = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { idea_json, recycled_materials, base64_image } = req.body;

  const craftIdea = await craftService.saveCraftFromBase64({
    user_id: req.user!.userId,
    idea_json,
    recycled_materials,
    base64_image, // ✅ Will be uploaded to S3
  });

  sendSuccess(res, craftIdea, 'Craft idea saved successfully', 201);
});

export const getCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    search: req.query.search as string,
    material: req.query.material as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
  };

  const result = await craftService.getCraftIdeas(options);
  sendPaginatedSuccess(res, result.data, result.meta, 'Craft ideas retrieved');
});

export const getCraftIdeaById = asyncHandler(async (req: Request, res: Response) => {
  const ideaId = Number(req.params.idea_id);
  const craftIdea = await craftService.getCraftIdeaById(ideaId);
  
  sendSuccess(res, craftIdea, 'Craft idea retrieved successfully');
});

export const getCraftIdeasByUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.user_id);
  const craftIdeas = await craftService.getCraftIdeasByUser(userId);
  
  sendSuccess(res, craftIdeas, 'User craft ideas retrieved successfully');
});

export const deleteCraftIdea = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ideaId = Number(req.params.idea_id);
  
  await craftService.deleteCraftIdea(ideaId, req.user!.userId);
  sendSuccess(res, null, 'Craft idea deleted successfully');
});

export const updateCraftIdea = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ideaId = Number(req.params.idea_id);
  
  const updated = await craftService.updateCraftIdea(
    ideaId,
    req.user!.userId,
    req.body
  );
  
  sendSuccess(res, updated, 'Craft idea updated successfully');
});

export const countCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : undefined;
  const total = await craftService.countCraftIdeas(userId);
  
  sendSuccess(res, { total }, 'Craft ideas count retrieved');
});

export const getRecentCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const crafts = await craftService.getRecentCraftIdeas(limit);
  
  sendSuccess(res, crafts, 'Recent craft ideas retrieved');
});

/**
 * ✅ Toggle save/unsave craft (for already-saved crafts)
 * POST /api/v1/crafts/:idea_id/toggle-save
 */
export const toggleSaveCraft = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ideaId = Number(req.params.idea_id);
  
  const result = await craftService.toggleSaveCraft(ideaId, req.user!.userId);
  
  const message = result.isSaved 
    ? 'Craft idea saved successfully' 
    : 'Craft idea unsaved successfully';
  
  sendSuccess(res, result, message);
});

/**
 * ✅ Get saved craft ideas
 * GET /api/v1/crafts/saved/list
 */
export const getSavedCraftIdeas = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  
  const result = await craftService.getSavedCraftIdeas(req.user!.userId, page, limit);
  
  sendPaginatedSuccess(res, result.data, result.meta, 'Saved craft ideas retrieved');
});

/**
 * ✅ Get user craft stats
 * GET /api/v1/crafts/stats/user
 */
export const getUserCraftStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await craftService.getUserCraftStats(req.user!.userId);
  
  sendSuccess(res, stats, 'User craft statistics retrieved');
});