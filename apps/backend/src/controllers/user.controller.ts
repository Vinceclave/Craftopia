import * as userService from '../services/user.service';
import { sendSuccess,sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from "express";
import { logger } from '../utils/logger';
import prisma from '../config/prisma';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  
  logger.debug('Fetching user profile', { userId });
  
  const profile = await userService.getUserProfile(userId);
  
  sendSuccess(res, profile, 'Profile retrieved successfully');
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { full_name, bio, profile_picture_url, home_dashboard_layout } = req.body;
  
  logger.info('Updating user profile', { userId });
  
  const profile = await userService.updateUserProfile(userId, {
    full_name,
    bio,
    profile_picture_url,
    home_dashboard_layout
  });
  
  logger.info('Profile updated successfully', { userId });
  
  sendSuccess(res, profile, 'Profile updated successfully');
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  
  logger.debug('Fetching public user profile', { userId });
  
  const user = await userService.getPublicUserProfile(userId);
  
  sendSuccess(res, user, 'User retrieved successfully');
});

export const getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  
  logger.debug('Fetching user statistics', { userId });
  
  const stats = await userService.getUserStats(userId);
  
  sendSuccess(res, stats, 'User stats retrieved successfully');
});

export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  
  logger.debug('Fetching leaderboard', { page, limit });
  
  const result = await userService.getPointsLeaderboard(page, limit);
  
  sendPaginatedSuccess(res, result.data, result.meta, 'Leaderboard retrieved successfully');
});

export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { password } = req.body;
  
  logger.info('Account deletion request', { userId });
  
  // Verify password before deletion
  const user = await userService.findUserById(userId);
  if (!user) {
    logger.error('User not found for deletion', { userId });
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  const bcrypt = require('bcrypt');
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    logger.warn('Invalid password for account deletion', { userId });
    return res.status(401).json({
      success: false,
      error: 'Invalid password'
    });
  }
  
  // Soft delete user account
  await prisma.user.update({
    where: { user_id: userId },
    data: { 
      deleted_at: new Date(),
      is_active: false 
    }
  });
  
  // Soft delete user profile
  await prisma.userProfile.updateMany({
    where: { user_id: userId },
    data: { deleted_at: new Date() }
  });
  
  logger.info('Account deleted successfully', { userId });
  
  sendSuccess(res, null, 'Account deleted successfully');
});

export const updateEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { newEmail, password } = req.body;
  
  logger.info('Email update request', { userId, newEmail });
  
  // Verify password
  const user = await userService.findUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  const bcrypt = require('bcrypt');
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    logger.warn('Invalid password for email update', { userId });
    return res.status(401).json({
      success: false,
      error: 'Invalid password'
    });
  }
  
  // Check if email already exists
  const existingUser = await userService.findUserByUsernameOrEmail(newEmail);
  if (existingUser && existingUser.user_id !== userId) {
    logger.warn('Email already in use', { newEmail });
    return res.status(409).json({
      success: false,
      error: 'Email already in use'
    });
  }
  
  // Update email
  const updated = await prisma.user.update({
    where: { user_id: userId },
    data: { 
      email: newEmail,
      is_email_verified: false // Require re-verification
    },
    select: {
      user_id: true,
      username: true,
      email: true,
      is_email_verified: true
    }
  });
  
  logger.info('Email updated successfully', { userId, newEmail });
  
  sendSuccess(res, updated, 'Email updated successfully. Please verify your new email.');
});
