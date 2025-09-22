import { Request, Response } from 'express';
import * as craftService from '../services/craft.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess, sendError, createPaginationMeta } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createCraftIdea = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { idea_json, recycled_materials } = req.body;
  const craftIdea = await craftService.createCraftIdea({
    generated_by_user_id: req.user!.userId,
    idea_json,
    recycled_materials,
  });
  sendSuccess(res, craftIdea, 'Craft idea created successfully', 201);
});

export const getCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
  
  const options = {
    page,
    limit,
    search: req.query.search ? String(req.query.search).trim() : undefined,
    material: req.query.material ? String(req.query.material).trim() : undefined,
    startDate: req.query.startDate ? String(req.query.startDate) : undefined,
    endDate: req.query.endDate ? String(req.query.endDate) : undefined,
    user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
  };

  // Validate user_id if provided
  if (options.user_id && options.user_id <= 0) {
    return sendError(res, 'Invalid user ID', 400);
  }

  const result = await craftService.getCraftIdeas(options);
  const meta = createPaginationMeta(result.meta.total, page, limit);
  
  sendPaginatedSuccess(res, result.data, meta, 'Craft ideas retrieved successfully');
});

export const getCraftIdeaById = asyncHandler(async (req: Request, res: Response) => {
  const ideaId = Number(req.params.idea_id);
  
  if (!ideaId || ideaId <= 0) {
    return sendError(res, 'Invalid craft idea ID', 400);
  }
  
  const craftIdea = await craftService.getCraftIdeaById(ideaId);
  sendSuccess(res, craftIdea, 'Craft idea retrieved successfully');
});

export const getCraftIdeasByUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.user_id);
  
  if (!userId || userId <= 0) {
    return sendError(res, 'Invalid user ID', 400);
  }
  
  const craftIdeas = await craftService.getCraftIdeasByUser(userId);
  sendSuccess(res, craftIdeas, 'User craft ideas retrieved successfully');
});

export const deleteCraftIdea = asyncHandler(async (req: AuthRequest, res: Response) => {
  const ideaId = Number(req.params.idea_id);
  
  if (!ideaId || ideaId <= 0) {
    return sendError(res, 'Invalid craft idea ID', 400);
  }
  
  const deleted = await craftService.deleteCraftIdea(ideaId, req.user!.userId);
  sendSuccess(res, deleted, 'Craft idea deleted successfully');
});

export const countCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : undefined;
  
  if (userId && userId <= 0) {
    return sendError(res, 'Invalid user ID', 400);
  }
  
  const total = await craftService.countCraftIdeas(userId);
  sendSuccess(res, { total }, 'Craft ideas count retrieved successfully');
});

export const getRecentCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 5));
  const crafts = await craftService.getRecentCraftIdeas(limit);
  sendSuccess(res, crafts, 'Recent craft ideas retrieved successfully');
});