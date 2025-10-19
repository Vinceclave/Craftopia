import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as dashboardService from "../../services/admin/dashboard.service";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
});

export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 7;
  const logs = await dashboardService.getActivityLogs(days);
  sendSuccess(res, logs, 'Activity logs retrieved successfully');
});

export const getTopUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  const users = await dashboardService.getTopUsers(limit);
  sendSuccess(res, users, 'Top users retrieved successfully');
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 20;
  const activity = await dashboardService.getRecentActivity(limit);
  sendSuccess(res, activity, 'Recent activity retrieved successfully');
});