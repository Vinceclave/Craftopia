// apps/backend/src/services/admin/userManagement.service.ts - REFACTORED COMPLETE VERSION

import prisma from "../../config/prisma";
import { BaseService } from "../base.service";
import { AppError, ValidationError } from "../../utils/error";
import { UserRole, ModerationAction } from "../../generated/prisma";
import { logger } from "../../utils/logger";
import WebSocketEmitter from "../../websocket/events";

export interface UserFilter {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  sortBy?: 'created_at' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
}

class UserManagementService extends BaseService {
  async getAllUsers(filters: UserFilter) {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      isVerified,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = filters;

    logger.debug('Fetching all users', { filters });

    const where: any = { deleted_at: null };

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      this.validateEnum(role, UserRole, 'role');
      where.role = role;
    }

    if (typeof isActive === 'boolean') {
      where.is_active = isActive;
    }

    if (typeof isVerified === 'boolean') {
      where.is_email_verified = isVerified;
    }

    try {
      const result = await this.paginate<any>(prisma.user, {
        page,
        limit,
        where,
        orderBy: { [sortBy]: sortOrder }
      });

      // Transform data to include additional info
      const transformedData = await Promise.all(
        result.data.map(async (user) => {
          const [profile, counts] = await Promise.all([
            prisma.userProfile.findUnique({
              where: { user_id: user.user_id },
              select: { points: true, profile_picture_url: true }
            }),
            prisma.$transaction([
              prisma.post.count({ where: { user_id: user.user_id, deleted_at: null } }),
              prisma.comment.count({ where: { user_id: user.user_id, deleted_at: null } }),
              prisma.userChallenge.count({ 
                where: { user_id: user.user_id, status: 'completed', deleted_at: null } 
              })  
            ])
          ]);

          return {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            is_email_verified: user.is_email_verified,
            created_at: user.created_at,
            profile: profile || { points: 0, profile_picture_url: null },
            _count: {
              posts: counts[0],
              comments: counts[1],
              userChallenges: counts[2]
            }
          };
        })
      );

      logger.info('Users fetched successfully', { 
        count: transformedData.length, 
        total: result.meta.total 
      });

      return {
        data: transformedData,
        meta: result.meta
      };
    } catch (error) {
      logger.error('Error fetching users', error);
      throw new AppError('Failed to fetch users', 500);
    }
  }

  async getUserDetails(userId: number) {
    this.validateId(userId, 'User ID');

    logger.debug('Fetching user details', { userId });

    try {
      const user = await this.checkNotDeleted(
        prisma.user,
        { user_id: userId, is_active: true },
        'User'
      );

      const [profile, counts, recentPosts, recentChallenges, recentReports] = await Promise.all([
        prisma.userProfile.findUnique({ where: { user_id: userId } }),
        prisma.$transaction([
          prisma.post.count({ where: { user_id: userId, deleted_at: null } }),
          prisma.comment.count({ where: { user_id: userId, deleted_at: null } }),
          prisma.like.count({ where: { user_id: userId, deleted_at: null } }),
          prisma.craftIdea.count({ where: { generated_by_user_id: userId, deleted_at: null } }),
          prisma.userChallenge.count({ where: { user_id: userId, deleted_at: null } }),
          prisma.report.count({ where: { reporter_id: userId } })
        ]),
        prisma.post.findMany({
          where: { user_id: userId, deleted_at: null },
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            post_id: true,
            title: true,
            created_at: true,
            _count: {
              select: {
                likes: { where: { deleted_at: null } },
                comments: { where: { deleted_at: null } }
              }
            }
          }
        }),
        prisma.userChallenge.findMany({
          where: { user_id: userId, deleted_at: null },
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            challenge: {
              select: { challenge_id: true, title: true }
            }
          }
        }),
        prisma.report.findMany({
          where: { reporter_id: userId },
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            report_id: true,
            status: true,
            reason: true,
            created_at: true
          }
        })
      ]);

      const userDetails = {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_active: user.is_active,
          is_email_verified: user.is_email_verified,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        profile,
        _count: {
          posts: counts[0],
          comments: counts[1],
          likes: counts[2],
          craftIdeas: counts[3],
          userChallenges: counts[4],
          reportsFiled: counts[5]
        },
        recentActivity: {
          posts: recentPosts,
          challenges: recentChallenges,
          reports: recentReports
        }
      };

      logger.info('User details fetched successfully', { userId });

      return userDetails;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error fetching user details', error);
      throw new AppError('Failed to fetch user details', 500);
    }
  }

  async toggleUserStatus(userId: number, adminId: number) {
    this.validateId(userId, 'User ID');
    this.validateId(adminId, 'Admin ID');

    if (userId === adminId) {
      throw new ValidationError('Cannot modify your own status');
    }

    logger.info('Toggling user status', { userId, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const user = await tx.user.findFirst({
          where: { user_id: userId, deleted_at: null }
        });

        if (!user) {
          throw new AppError('User not found', 404);
        }

        const newStatus = !user.is_active;

        const updatedUser = await tx.user.update({
          where: { user_id: userId },
          data: { is_active: newStatus },
          select: {
            user_id: true,
            username: true,
            email: true,
            is_active: true,
            role: true
          }
        });

        await tx.moderationLog.create({
          data: {
            admin_id: adminId,
            action: newStatus ? ModerationAction.warn_user : ModerationAction.ban_user,
            target_id: userId.toString(),
            target_user_id: userId,
            reason: newStatus 
              ? 'Account reactivated by admin' 
              : 'Account suspended by admin'
          }
        });

        logger.info('User status toggled successfully', { 
          userId, 
          newStatus: newStatus ? 'active' : 'banned' 
        });

        // 🔥 WEBSOCKET: Notify user of status change
        if (newStatus) {
          WebSocketEmitter.userUnbanned(userId);
        } else {
          WebSocketEmitter.userBanned(userId, {
            reason: 'Account suspended by admin',
            suspendedBy: adminId
          });
        }
        return updatedUser;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error toggling user status', error);
      throw new AppError('Failed to update user status', 500);
    }
  }

  async updateUserRole(userId: number, newRole: UserRole, adminId: number) {
    this.validateId(userId, 'User ID');
    this.validateId(adminId, 'Admin ID');

    if (userId === adminId) {
      throw new ValidationError('Cannot modify your own role');
    }

    this.validateEnum(newRole, UserRole, 'role');

    logger.info('Updating user role', { userId, newRole, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const user = await tx.user.findFirst({
          where: { user_id: userId, deleted_at: null }
        });

        if (!user) {
          throw new AppError('User not found', 404);
        }

        const updatedUser = await tx.user.update({
          where: { user_id: userId },
          data: { role: newRole },
          select: {
            user_id: true,
            username: true,
            email: true,
            role: true
          }
        });

        await tx.moderationLog.create({
          data: {
            admin_id: adminId,
            action: ModerationAction.warn_user,
            target_id: userId.toString(),
            target_user_id: userId,
            reason: `Role changed to ${newRole}`
          }
        });

        logger.info('User role updated successfully', { userId, newRole });

        // 🔥 WEBSOCKET: Notify user of role change
        WebSocketEmitter.notification(userId, {
          type: 'role_changed',
          title: 'Role Updated',
          message: `Your role has been changed to ${newRole}`,
          data: { newRole }
        });
        return updatedUser;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error updating user role', error);
      throw new AppError('Failed to update user role', 500);
    }
  }

  async deleteUser(userId: number, adminId: number) {
    this.validateId(userId, 'User ID');
    this.validateId(adminId, 'Admin ID');

    if (userId === adminId) {
      throw new ValidationError('Cannot delete your own account');
    }

    logger.info('Deleting user', { userId, adminId });

    try {
      return await this.executeTransaction(async (tx) => {
        const user = await tx.user.findFirst({
          where: { user_id: userId, deleted_at: null }
        });

        if (!user) {
          throw new AppError('User not found or already deleted', 404);
        }

        // Soft delete user's content
        await Promise.all([
          tx.post.updateMany({
            where: { user_id: userId },
            data: { deleted_at: new Date() }
          }),
          tx.comment.updateMany({
            where: { user_id: userId },
            data: { deleted_at: new Date() }
          }),
          tx.craftIdea.updateMany({
            where: { generated_by_user_id: userId },
            data: { deleted_at: new Date() }
          }),
          tx.userChallenge.updateMany({
            where: { user_id: userId },
            data: { deleted_at: new Date() }
          }),
          tx.chatbotConversation.updateMany({
            where: { user_id: userId },
            data: { deleted_at: new Date() }
          }),
          tx.like.updateMany({
            where: { user_id: userId },
            data: { deleted_at: new Date() }
          })
        ]);

        // Hard delete refresh tokens
        await tx.refreshToken.deleteMany({
          where: { user_id: userId }
        });

        // Soft delete user profile
        await tx.userProfile.updateMany({
          where: { user_id: userId },
          data: { deleted_at: new Date() }
        });

        // Soft delete user account
        await tx.user.update({
          where: { user_id: userId },
          data: {
            is_active: false,
            deleted_at: new Date()
          }
        });

        // Log the action
        await tx.moderationLog.create({
          data: {
            admin_id: adminId,
            action: ModerationAction.ban_user,
            target_id: userId.toString(),
            target_user_id: userId,
            reason: 'User account permanently deleted by admin'
          }
        });

        logger.info('User deleted successfully', { userId });

        // 🔥 WEBSOCKET: Force disconnect user
        WebSocketEmitter.userBanned(userId, {
          reason: 'Account permanently deleted',
          permanent: true
        });

        return { 
          success: true,
          message: 'User account and associated content deleted successfully',
          userId 
        };
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error deleting user', error);
      throw new AppError('Failed to delete user', 500);
    }
  }

  async getUserStatistics(userId: number) {
    this.validateId(userId, 'User ID');

    logger.debug('Fetching user statistics', { userId });

    try {
      const [
        totalPosts,
        totalComments,
        totalLikes,
        totalCrafts,
        completedChallenges,
        totalPoints,
        reportsFiled,
        reportsReceived
      ] = await Promise.all([
        prisma.post.count({ where: { user_id: userId, deleted_at: null } }),
        prisma.comment.count({ where: { user_id: userId, deleted_at: null } }),
        prisma.like.count({ where: { user_id: userId, deleted_at: null } }),
        prisma.craftIdea.count({ where: { generated_by_user_id: userId, deleted_at: null } }),
        prisma.userChallenge.count({ 
          where: { user_id: userId, status: 'completed', deleted_at: null } 
        }),
        prisma.userChallenge.aggregate({
          where: { user_id: userId, status: 'completed', deleted_at: null },
          _sum: { points_awarded: true }
        }),
        prisma.report.count({ where: { reporter_id: userId } }),
        prisma.report.count({
          where: {
            OR: [
              { reported_post: { user_id: userId, deleted_at: null } },
              { reported_comment: { user_id: userId, deleted_at: null } }
            ]
          }
        })
      ]);

      const stats = {
        content: {
          posts: totalPosts,
          comments: totalComments,
          likes: totalLikes,
          crafts: totalCrafts
        },
        challenges: {
          completed: completedChallenges,
          totalPoints: totalPoints._sum.points_awarded || 0
        },
        reports: {
          filed: reportsFiled,
          received: reportsReceived
        }
      };

      logger.info('User statistics fetched successfully', { userId });

      return stats;
    } catch (error) {
      logger.error('Error fetching user statistics', error);
      throw new AppError('Failed to fetch user statistics', 500);
    }
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();

// Export individual functions for backward compatibility
export const getAllUsers = userManagementService.getAllUsers.bind(userManagementService);
export const getUserDetails = userManagementService.getUserDetails.bind(userManagementService);
export const toggleUserStatus = userManagementService.toggleUserStatus.bind(userManagementService);
export const updateUserRole = userManagementService.updateUserRole.bind(userManagementService);
export const deleteUser = userManagementService.deleteUser.bind(userManagementService);
export const getUserStatistics = userManagementService.getUserStatistics.bind(userManagementService);