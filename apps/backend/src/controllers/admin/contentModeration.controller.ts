// apps/backend/src/controllers/admin/contentModeration.controller.ts - CLEANED VERSION

import * as contentModerationService from "../../services/admin/contentModeration.service";
import { asyncHandler } from "../base.controller";
import { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { logger } from "../../utils/logger";

export const getContentForReview = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  
  logger.debug('Get content for review request', { page, limit });
  
  const content = await contentModerationService.getContentForReview(page, limit);
  
  sendSuccess(res, content, 'Content for review retrieved successfully');
});

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const { reason } = req.body;
  const adminId = req.user!.userId;
  
  logger.info('Delete post request', { postId, adminId });
  
  const post = await contentModerationService.deletePost(postId, adminId, reason);
  
  sendSuccess(res, post, 'Post deleted successfully');
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = Number(req.params.commentId);
  const { reason } = req.body;
  const adminId = req.user!.userId;
  
  logger.info('Delete comment request', { commentId, adminId });
  
  const comment = await contentModerationService.deleteComment(commentId, adminId, reason);
  
  sendSuccess(res, comment, 'Comment deleted successfully');
});

export const bulkDeletePosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postIds, reason } = req.body;
  const adminId = req.user!.userId;
  
  logger.info('Bulk delete posts request', { count: postIds?.length, adminId });
  
  const result = await contentModerationService.bulkDeletePosts(postIds, adminId, reason);
  
  sendSuccess(res, result, 'Posts deleted successfully');
});

export const restorePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const adminId = req.user!.userId;
  
  logger.info('Restore post request', { postId, adminId });
  
  const post = await contentModerationService.restorePost(postId, adminId);
  
  sendSuccess(res, post, 'Post restored successfully');
});

export const featurePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const adminId = req.user!.userId;
  
  logger.info('Feature post request', { postId, adminId });
  
  const post = await contentModerationService.featurePost(postId, adminId);
  
  sendSuccess(res, post, 'Post feature status updated successfully');
});