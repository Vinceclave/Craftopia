// apps/backend/src/controllers/admin/dashboard.controller.ts - FIXED VERSION

import { Request, Response } from "express";
import { asyncHandler } from "../base.controller"; // ✅ Fixed import path
import { sendSuccess } from "../../utils/response";
import { AuthRequest } from "../../middlewares/auth.middleware";
import * as dashboardService from "../../services/admin/dashboard.service";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  console.log('📊 Dashboard: Fetching stats...');
  
  try {
    const stats = await dashboardService.getDashboardStats();
    console.log('✅ Dashboard: Stats retrieved successfully');
    console.log('Stats preview:', {
      totalUsers: stats.users.total,
      totalPosts: stats.content.totalPosts,
      activeChallenges: stats.challenges.active
    });
    
    sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
  } catch (error) {
    console.error('❌ Dashboard: Error fetching stats:', error);
    throw error; // Let error handler middleware catch it
  }
});

export const getActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 7;
  console.log('📊 Dashboard: Fetching activity logs for', days, 'days');
  
  try {
    const logs = await dashboardService.getActivityLogs(days);
    console.log('✅ Dashboard: Activity logs retrieved:', logs.length, 'entries');
    
    sendSuccess(res, logs, 'Activity logs retrieved successfully');
  } catch (error) {
    console.error('❌ Dashboard: Error fetching activity logs:', error);
    throw error;
  }
});

export const getTopUsers = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 10;
  console.log('📊 Dashboard: Fetching top', limit, 'users');
  
  try {
    const users = await dashboardService.getTopUsers(limit);
    console.log('✅ Dashboard: Top users retrieved:', users.length, 'users');
    
    sendSuccess(res, users, 'Top users retrieved successfully');
  } catch (error) {
    console.error('❌ Dashboard: Error fetching top users:', error);
    throw error;
  }
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) || 20;
  console.log('📊 Dashboard: Fetching recent activity, limit:', limit);
  
  try {
    const activity = await dashboardService.getRecentActivity(limit);
    console.log('✅ Dashboard: Recent activity retrieved');
    
    sendSuccess(res, activity, 'Recent activity retrieved successfully');
  } catch (error) {
    console.error('❌ Dashboard: Error fetching recent activity:', error);
    throw error;
  }
});