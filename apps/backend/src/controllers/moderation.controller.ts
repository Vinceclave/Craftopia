import { Request, Response } from "express";
import * as moderationService from "../services/moderation.service";
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createLog = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { action, targetId, targetUserId, reason } = req.body;
  const log = await moderationService.createModerationLog({
    adminId: req.user!.userId,
    action,
    targetId,
    targetUserId,
    reason,
  });
  sendSuccess(res, log, 'Moderation log created successfully', 201);
});

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await moderationService.getModerationLogs(page, limit);
  sendPaginatedSuccess(res, result.data, result.meta, 'Moderation logs retrieved successfully');
});

export const getLogById = asyncHandler(async (req: Request, res: Response) => {
  const logId = Number(req.params.logId);
  const log = await moderationService.getModerationLogById(logId);
  sendSuccess(res, log, 'Moderation log retrieved successfully');
});
