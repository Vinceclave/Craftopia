import { Request, Response, NextFunction } from 'express';
import * as postService from '../services/post.service';

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, content, imageUrl } = req.body;
    const post = await postService.createPost({ userId, content, imageUrl });
    res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    next(error);
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const posts = await postService.getPosts(page, limit);
    res.status(200).json({ success: true, ...posts });
  } catch (error: any) {
    next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const post = await postService.getPostById(postId);
    if (!post) throw { statusCode: 404, message: 'Post not found' };
    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const post = await postService.deletePost(postId);
    res.status(200).json({ success: true, data: post });
  } catch (error: any) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId, userId, content } = req.body;
    const comment = await postService.addComment({ postId, userId, content });
    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    next(error);
  }
};

export const getCommentsByPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const comments = await postService.getCommentsByPost(postId);
    res.status(200).json({ success: true, data: comments });
  } catch (error: any) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commentId = Number(req.params.commentId);
    const comment = await postService.deleteComment(commentId);
    res.status(200).json({ success: true, data: comment });
  } catch (error: any) {
    next(error);
  }
};

export const handlePostReactionToggle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const { userId } = req.body;
    const reaction = await postService.togglePostReaction(postId, userId);
    res.status(200).json({ success: true, data: reaction });
  } catch (error: any) {
    next(error);
  }
};

export const getPostReactionCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.postId);
    const total = await postService.countReactions(postId);
    res.status(200).json({ success: true, total });
  } catch (error: any) {
    next(error);
  }
};
