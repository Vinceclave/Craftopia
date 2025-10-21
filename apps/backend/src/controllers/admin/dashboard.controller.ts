// apps/backend/src/controllers/admin/dashboard.controller.ts - CLEANED VERSION

import { Request, Response } from "express";
import { asyncHandler } from "../base.controller";
import { sendSuccess } from "../../utils/response";
import * as dashboardService from "../../services/admin/dashboard.service";
import { logger } from "../../utils/logger";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  logger.debug('Dashboard stats request');
  
  const stats = await dashboardService.getDashboardStats();
  
  sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
});

export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 7;
  
  logger.debug('Activity logs request', { days });
  
  const logs = await dashboardService.getActivityLogs(days);
  
  sendSuccess(res, logs, 'Activity logs retrieved successfully');
});

export const getTopUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  
  logger.debug('Top users request', { limit });
  
  const users = await dashboardService.getTopUsers(limit);
  
  sendSuccess(res, users, 'Top users retrieved successfully');
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 20;
  
  logger.debug('Recent activity request', { limit });
  
  const activity = await dashboardService.getRecentActivity(limit);
  
  sendSuccess(res, activity, 'Recent activity retrieved successfully');
});