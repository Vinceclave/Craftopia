// apps/backend/src/controllers/admin/contentModeration.controller.ts - COMPLETE FIXED VERSION

import * as contentModerationService from "../../services/admin/contentModeration.service";
import { asyncHandler } from "../base.controller";
import { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import type { AuthRequest } from "../../middlewares/auth.middleware";

export const getContentForReview = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  
  console.log('🔍 Controller: Getting content for review', { page, limit });
  
  const content = await contentModerationService.getContentForReview(page, limit);
  
  console.log('✅ Controller: Content retrieved', {
    postsCount: content.posts.length,
    commentsCount: content.comments.length
  });
  
  sendSuccess(res, content, 'Content for review retrieved successfully');
});

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const { reason } = req.body;
  const adminId = req.user!.userId;
  
  console.log('🗑️ Controller: Deleting post', { postId, adminId });
  
  const post = await contentModerationService.deletePost(postId, adminId, reason);
  sendSuccess(res, post, 'Post deleted successfully');
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = Number(req.params.commentId);
  const { reason } = req.body;
  const adminId = req.user!.userId;
  
  console.log('🗑️ Controller: Deleting comment', { commentId, adminId });
  
  const comment = await contentModerationService.deleteComment(commentId, adminId, reason);
  sendSuccess(res, comment, 'Comment deleted successfully');
});

export const bulkDeletePosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postIds, reason } = req.body;
  const adminId = req.user!.userId;
  
  console.log('🗑️ Controller: Bulk deleting posts', { count: postIds?.length, adminId });
  
  const result = await contentModerationService.bulkDeletePosts(postIds, adminId, reason);
  sendSuccess(res, result, 'Posts deleted successfully');
});

export const restorePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const adminId = req.user!.userId;
  
  console.log('♻️ Controller: Restoring post', { postId, adminId });
  
  const post = await contentModerationService.restorePost(postId, adminId);
  sendSuccess(res, post, 'Post restored successfully');
});

export const featurePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const adminId = req.user!.userId;
  
  console.log('⭐ Controller: Toggling post feature', { postId, adminId });
  
  const post = await contentModerationService.featurePost(postId, adminId);
  sendSuccess(res, post, 'Post feature status updated successfully');
});