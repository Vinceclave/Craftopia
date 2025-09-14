import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const profile = await userService.getUserProfile(userId);
  sendSuccess(res, profile, 'Profile retrieved successfully');
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { bio, profile_picture_url, home_dashboard_layout } = req.body;
  
  const profile = await userService.updateUserProfile(userId, {
    bio,
    profile_picture_url,
    home_dashboard_layout
  });
  
  sendSuccess(res, profile, 'Profile updated successfully');
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const user = await userService.getPublicUserProfile(userId);
  sendSuccess(res, user, 'User retrieved successfully');
});

export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const stats = await userService.getUserStats(userId);
  sendSuccess(res, stats, 'User stats retrieved successfully');
});

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  
  const result = await userService.getPointsLeaderboard(page, limit);
  sendPaginatedSuccess(res, result.data, result.meta, 'Leaderboard retrieved successfully');
});