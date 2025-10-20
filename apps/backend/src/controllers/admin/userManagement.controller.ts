import * as userManagementService from "../../services/admin/usermanagement.service";
import { asyncHandler } from "../base.controller";
import { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import type { AuthRequest } from "../../middlewares/auth.middleware";


export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search as string,
    role: req.query.role as any,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
    sortBy: (req.query.sortBy as any) || 'created_at',
    sortOrder: (req.query.sortOrder as any) || 'desc'
  };

  const result = await userManagementService.getAllUsers(filters);
  sendSuccess(res, result, 'Users retrieved successfully', 200);
});

export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const details = await userManagementService.getUserDetails(userId);
  sendSuccess(res, details, 'User details retrieved successfully');
});

export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const adminId = req.user!.userId;
  
  const user = await userManagementService.toggleUserStatus(userId, adminId);
  sendSuccess(res, user, 'User status updated successfully');
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const { role } = req.body;
  const adminId = req.user!.userId;
  
  const user = await userManagementService.updateUserRole(userId, role, adminId);
  sendSuccess(res, user, 'User role updated successfully');
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const adminId = req.user!.userId;
  
  const result = await userManagementService.deleteUser(userId, adminId);
  sendSuccess(res, result, 'User deleted successfully');
});

export const getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const stats = await userManagementService.getUserStatistics(userId);
  sendSuccess(res, stats, 'User statistics retrieved successfully');
});
