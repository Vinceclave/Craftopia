// apps/backend/src/controllers/admin/userManagement.controller.ts - FIXED VERSION

import * as userManagementService from "../../services/admin/userManagement.service";
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

  console.log('📊 Fetching users with filters:', filters);

  const result = await userManagementService.getAllUsers(filters);
  
  console.log('✅ Users fetched:', {
    count: result.data.length,
    total: result.meta.total,
    page: result.meta.page
  });

  sendSuccess(res, result, 'Users retrieved successfully', 200);
});

export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  
  console.log('🔍 Fetching user details for:', userId);
  
  const details = await userManagementService.getUserDetails(userId);
  
  console.log('✅ User details fetched for:', userId);
  
  sendSuccess(res, details, 'User details retrieved successfully');
});

// ✅ FIX: Ban/Unban user (toggle is_active)
export const toggleUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const adminId = req.user!.userId;
  
  console.log('🔄 Toggling user status:', { userId, adminId });
  
  const user = await userManagementService.toggleUserStatus(userId, adminId);
  
  console.log('✅ User status toggled:', {
    userId: user.user_id,
    newStatus: user.is_active ? 'active' : 'banned'
  });
  
  sendSuccess(
    res, 
    user, 
    user.is_active 
      ? 'User account reactivated successfully' 
      : 'User account banned successfully'
  );
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const { role } = req.body;
  const adminId = req.user!.userId;
  
  console.log('👤 Updating user role:', { userId, newRole: role, adminId });
  
  const user = await userManagementService.updateUserRole(userId, role, adminId);
  
  console.log('✅ User role updated:', { userId: user.user_id, newRole: user.role });
  
  sendSuccess(res, user, `User role updated to ${role} successfully`);
});

// ✅ FIX: Permanent delete user
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const adminId = req.user!.userId;
  
  console.log('🗑️ Deleting user:', { userId, adminId });
  
  const result = await userManagementService.deleteUser(userId, adminId);
  
  console.log('✅ User deleted:', result);
  
  sendSuccess(res, result, 'User account permanently deleted successfully');
});

export const getUserStatistics = asyncHandler(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  
  console.log('📈 Fetching user statistics for:', userId);
  
  const stats = await userManagementService.getUserStatistics(userId);
  
  console.log('✅ User statistics fetched for:', userId);
  
  sendSuccess(res, stats, 'User statistics retrieved successfully');
});