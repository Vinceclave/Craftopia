// apps/backend/src/controllers/sponsor.controller.ts
import { Response } from "express";
import * as sponsorService from "../services/sponsor.service";
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendPaginatedSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

// ==========================================
// SPONSOR CONTROLLERS
// ==========================================

export const createSponsor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sponsor = await sponsorService.createSponsor({
    ...req.body,
    created_by_admin_id: req.user!.userId
  });
  
  sendSuccess(res, sponsor, 'Sponsor created successfully', 201);
});

export const getSponsors = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const activeOnly = req.query.activeOnly === 'true';
  
  const result = await sponsorService.getSponsors(page, limit, activeOnly);
  sendPaginatedSuccess(res, result.data, result.meta, 'Sponsors retrieved successfully');
});

export const getSponsorById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sponsorId = Number(req.params.sponsorId);
  
  const sponsor = await sponsorService.getSponsorById(sponsorId);
  sendSuccess(res, sponsor, 'Sponsor retrieved successfully');
});

export const updateSponsor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sponsorId = Number(req.params.sponsorId);
  
  const sponsor = await sponsorService.updateSponsor(sponsorId, req.body);
  sendSuccess(res, sponsor, 'Sponsor updated successfully');
});

export const deleteSponsor = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sponsorId = Number(req.params.sponsorId);
  
  await sponsorService.deleteSponsor(sponsorId);
  sendSuccess(res, null, 'Sponsor deleted successfully');
});

export const toggleSponsorStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sponsorId = Number(req.params.sponsorId);
  
  const sponsor = await sponsorService.toggleSponsorStatus(sponsorId);
  sendSuccess(res, sponsor, `Sponsor ${sponsor.is_active ? 'activated' : 'deactivated'} successfully`);
});

// ==========================================
// REWARD CONTROLLERS
// ==========================================

export const createReward = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reward = await sponsorService.createReward(req.body);
  
  sendSuccess(res, reward, 'Reward created successfully', 201);
});

export const getRewards = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const sponsor_id = req.query.sponsor_id ? Number(req.query.sponsor_id) : undefined;
  const active_only = req.query.activeOnly === 'true';
  const available_only = req.query.availableOnly === 'true';
  
  const result = await sponsorService.getRewards(page, limit, {
    sponsor_id,
    active_only,
    available_only
  });
  
  sendPaginatedSuccess(res, result.data, result.meta, 'Rewards retrieved successfully');
});

export const getRewardById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rewardId = Number(req.params.rewardId);
  
  const reward = await sponsorService.getRewardById(rewardId);
  sendSuccess(res, reward, 'Reward retrieved successfully');
});

export const updateReward = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rewardId = Number(req.params.rewardId);
  
  const reward = await sponsorService.updateReward(rewardId, req.body);
  sendSuccess(res, reward, 'Reward updated successfully');
});

export const deleteReward = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rewardId = Number(req.params.rewardId);
  
  await sponsorService.deleteReward(rewardId);
  sendSuccess(res, null, 'Reward deleted successfully');
});

export const toggleRewardStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rewardId = Number(req.params.rewardId);
  
  const reward = await sponsorService.toggleRewardStatus(rewardId);
  sendSuccess(res, reward, `Reward ${reward.is_active ? 'activated' : 'deactivated'} successfully`);
});

// ==========================================
// REDEMPTION CONTROLLERS
// ==========================================

export const redeemReward = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reward_id } = req.body;
  
  const result = await sponsorService.redeemReward(req.user!.userId, reward_id);
  sendSuccess(res, result, 'Reward redeemed successfully', 201);
});

export const getRedemptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const user_id = req.query.userId ? Number(req.query.userId) : undefined;
  const status = req.query.status as 'pending' | 'fulfilled' | 'cancelled' | undefined;
  
  const result = await sponsorService.getRedemptions(page, limit, {
    user_id,
    status
  });
  
  sendPaginatedSuccess(res, result.data, result.meta, 'Redemptions retrieved successfully');
});

export const fulfillRedemption = asyncHandler(async (req: AuthRequest, res: Response) => {
  const redemptionId = Number(req.params.redemptionId);
  
  const redemption = await sponsorService.fulfillRedemption(redemptionId);
  sendSuccess(res, redemption, 'Redemption fulfilled successfully');
});

export const cancelRedemption = asyncHandler(async (req: AuthRequest, res: Response) => {
  const redemptionId = Number(req.params.redemptionId);
  const refundPoints = req.body.refundPoints !== false; // Default to true
  
  const result = await sponsorService.cancelRedemption(redemptionId, refundPoints);
  sendSuccess(res, result, 'Redemption cancelled successfully');
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await sponsorService.getStats();
  sendSuccess(res, stats, 'Statistics retrieved successfully');
});