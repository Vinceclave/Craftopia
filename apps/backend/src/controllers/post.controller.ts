// apps/backend/src/controllers/post.controller.ts - COMPLETE VERSION WITH SEARCH & UPDATE
import { Request, Response } from 'express';
import * as postService from '../services/post.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import WebSocketEmitter from '../websocket/events';
import prisma from '../config/prisma';
 

export const createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, imageUrl, tags, category, featured } = req.body;
  const post = await postService.createPost({
    user_id: req.user!.userId,
    title,
    content,
    imageUrl,
    tags,
    category,
    featured,
  });
  sendSuccess(res, post, 'Post created successfully', 201);
});

// UPDATED: Include user ID for reaction status
export const getPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const feedTypeQuery = req.query.feedType;
  const feedType = 
    typeof feedTypeQuery === 'string' && 
    ['all', 'trending', 'popular', 'featured'].includes(feedTypeQuery)
      ? (feedTypeQuery as 'all' | 'trending' | 'popular' | 'featured')
      : 'all'; // Default to 'all' if not provided or invalid

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const userId = req.user?.userId; // Get current user ID for reaction status
  
  const result = await postService.getPosts(feedType, page, limit, userId);
  sendPaginatedSuccess(res, result.data, result.meta, 'Posts retrieved successfully');
});

// NEW: Search posts with filters
export const searchPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, category, tag } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const userId = req.user?.userId;
  
  const result = await postService.searchPosts({
    search: search as string,
    category: category as string,
    tag: tag as string,
    page,
    limit,
    userId
  });
  
  sendPaginatedSuccess(res, result.data, result.meta, 'Posts search results');
});

export const getTrendingTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await postService.getTrendingTags();
  sendSuccess(res, tags, 'Tags retrieved successfully' )
})

export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const post = await postService.getPostById(postId);
  sendSuccess(res, post, 'Post retrieved successfully');
});

// NEW: Update post
export const updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const { title, content, tags, imageUrl, category } = req.body;
  
  
  const post = await postService.updatePost(postId, req.user!.userId, {
    title,
    content,
    tags,
    imageUrl,
    category
  });
  
  sendSuccess(res, post, 'Post updated successfully');
});

export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const post = await postService.deletePost(postId, req.user!.userId);
  sendSuccess(res, post, 'Post deleted successfully');
});

export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postId, content } = req.body;
  const userId = req.user!.userId;
  
  const comment = await postService.addComment({ 
    postId, 
    userId, 
    content 
  });
  
  // ✅ GET USERNAME FROM DATABASE
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { username: true }
  });
  
  // ✅ Get updated comment count
  const postData = await prisma.post.findUnique({
    where: { post_id: postId },
    include: {
      _count: {
        select: { comments: true }
      }
    }
  });
  
  // ✅ EMIT WEBSOCKET EVENT
  WebSocketEmitter.broadcast('post:commented', {
    postId,
    commentId: comment.comment_id,
    userId,
    username: user?.username || `User ${userId}`,
    content: comment.content,
    commentCount: postData?._count.comments || 0,
  });
  
  sendSuccess(res, comment, 'Comment added successfully', 201);
});

export const getCommentsByPost = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const comments = await postService.getCommentsByPost(postId);
  sendSuccess(res, comments, 'Comments retrieved successfully');
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const commentId = Number(req.params.commentId);
  const comment = await postService.deleteComment(commentId, req.user!.userId);
  sendSuccess(res, comment, 'Comment deleted successfully');
});

// FIXED: Enhanced toggle reaction with consistent response
export const handlePostReactionToggle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const userId = req.user!.userId;
  
  // Use the enhanced toggle method that returns consistent data
  const reactionData = await postService.togglePostReaction(postId, userId);
  
  // ✅ GET USERNAME FROM DATABASE
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { username: true }
  });
  
  // ✅ EMIT WEBSOCKET EVENT TO ALL CLIENTS
  WebSocketEmitter.broadcast('post:liked', {
    postId: reactionData.postId,
    userId: reactionData.userId,
    username: user?.username || `User ${userId}`, // Fallback if user not found
    likeCount: reactionData.likeCount,
    isLiked: reactionData.isLiked,
  });
  
  // Send consistent response format
  sendSuccess(res, {
    isLiked: reactionData.isLiked,
    likeCount: reactionData.likeCount,
    postId: reactionData.postId,
    userId: reactionData.userId
  }, 'Reaction toggled successfully');
});

export const getPostReactionCount = asyncHandler(async (req: Request, res: Response) => {
  const postId = Number(req.params.postId);
  const total = await postService.countReactions(postId);
  sendSuccess(res, { total }, 'Reaction count retrieved successfully');
});

// NEW: Get user's reaction status for a specific post
export const getUserReactionStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const postId = Number(req.params.postId);
  const userId = req.user!.userId;
  const isLiked = await postService.getUserReactionStatus(postId, userId);
  sendSuccess(res, { isLiked, postId, userId }, 'User reaction status retrieved successfully');
});