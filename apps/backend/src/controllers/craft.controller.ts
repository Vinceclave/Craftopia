import { Request, Response } from 'express';
import * as craftService from '../services/craft.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
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
  const options = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    search: req.query.search ? String(req.query.search) : undefined,
    material: req.query.material ? String(req.query.material) : undefined,
    startDate: req.query.startDate ? String(req.query.startDate) : undefined,
    endDate: req.query.endDate ? String(req.query.endDate) : undefined,
    user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
  };

  const result = await craftService.getCraftIdeas(options);
  sendPaginatedSuccess(res, result.data, result.meta, 'Craft ideas retrieved successfully');
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
  const deleted = await craftService.deleteCraftIdea(ideaId, req.user!.userId);
  sendSuccess(res, deleted, 'Craft idea deleted successfully');
});

export const countCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.query.user_id ? Number(req.query.user_id) : undefined;
  const total = await craftService.countCraftIdeas(userId);
  sendSuccess(res, { total }, 'Craft ideas count retrieved successfully');
});

export const getRecentCraftIdeas = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const crafts = await craftService.getRecentCraftIdeas(limit);
  sendSuccess(res, crafts, 'Recent craft ideas retrieved successfully');
});