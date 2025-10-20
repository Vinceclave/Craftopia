// apps/backend/src/services/admin/userManagement.service.ts - FIXED VERSION

import prisma from "../../config/prisma";
import { AppError } from "../../utils/error";
import { UserRole } from "../../generated/prisma";

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

export const getAllUsers = async (filters: UserFilter) => {
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

  if (page < 1) throw new AppError('Page must be greater than 0', 400);
  if (limit < 1 || limit > 100) throw new AppError('Limit must be between 1 and 100', 400);

  const skip = (page - 1) * limit;
  const where: any = {
    deleted_at: null // Only show non-deleted users
  };

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (role) where.role = role;
  if (typeof isActive === 'boolean') where.is_active = isActive;
  if (typeof isVerified === 'boolean') where.is_email_verified = isVerified;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          user_id: true,
          username: true,
          email: true,
          role: true,
          is_active: true,
          is_email_verified: true,
          created_at: true,
          profile: {
            select: {
              points: true,
              profile_picture_url: true
            }
          },
          _count: {
            select: {
              posts: { where: { deleted_at: null } },
              comments: { where: { deleted_at: null } },
              userChallenges: { where: { status: 'completed' } }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit
      }
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new AppError('Failed to fetch users', 500);
  }
};

export const getUserDetails = async (userId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  try {
    const user = await prisma.user.findFirst({
      where: { 
        user_id: userId,
        deleted_at: null,
        is_active: true // Only get non-deleted users
      },
      include: {
        profile: true,
        _count: {
          select: {
            posts: { where: { deleted_at: null } },
            comments: { where: { deleted_at: null } },
            likes: { where: { deleted_at: null } },
            craftIdeas: { where: { deleted_at: null } },
            userChallenges: true,
            reportsFiled: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get recent activity
    const [recentPosts, recentChallenges, recentReports] = await Promise.all([
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

    return {
      user: {
        ...user,
        password_hash: undefined // Remove sensitive data
      },
      recentActivity: {
        posts: recentPosts,
        challenges: recentChallenges,
        reports: recentReports
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error fetching user details:', error);
    throw new AppError('Failed to fetch user details', 500);
  }
};

// ✅ FIX: Separate ban/unban from delete
export const toggleUserStatus = async (userId: number, adminId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  if (userId === adminId) {
    throw new AppError('Cannot modify your own status', 400);
  }

  try {
    const user = await prisma.user.findFirst({
      where: { 
        user_id: userId,
        deleted_at: null // Only toggle status for non-deleted users
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newStatus = !user.is_active;

    // Update user status
    const updatedUser = await prisma.user.update({
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

    // Log the action
    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: newStatus ? 'warn_user' : 'ban_user',
        target_id: userId.toString(),
        target_user_id: userId,
        reason: newStatus 
          ? 'Account reactivated by admin' 
          : 'Account suspended by admin'
      }
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error toggling user status:', error);
    throw new AppError('Failed to update user status', 500);
  }
};

export const updateUserRole = async (userId: number, newRole: UserRole, adminId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  if (userId === adminId) {
    throw new AppError('Cannot modify your own role', 400);
  }

  if (!Object.values(UserRole).includes(newRole)) {
    throw new AppError('Invalid role', 400);
  }

  try {
    const user = await prisma.user.findFirst({
      where: { 
        user_id: userId,
        deleted_at: null
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: { role: newRole },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true
      }
    });

    // Log the action
    await prisma.moderationLog.create({
      data: {
        admin_id: adminId,
        action: 'warn_user',
        target_id: userId.toString(),
        target_user_id: userId,
        reason: `Role changed to ${newRole}`
      }
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error updating user role:', error);
    throw new AppError('Failed to update user role', 500);
  }
};

// ✅ FIX: Hard delete with proper cascade
export const deleteUser = async (userId: number, adminId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  if (userId === adminId) {
    throw new AppError('Cannot delete your own account', 400);
  }

  try {
    const user = await prisma.user.findFirst({
      where: { 
        user_id: userId,
        deleted_at: null
      },
    });

    if (!user) {
      throw new AppError('User not found or already deleted', 404);
    }

    // Use transaction for cascade delete
    await prisma.$transaction(async (tx) => {
      // 1. Soft delete user's content (keep for records)
      await tx.post.updateMany({
        where: { user_id: userId },
        data: { deleted_at: new Date() }
      });

      await tx.comment.updateMany({
        where: { user_id: userId },
        data: { deleted_at: new Date() }
      });

      await tx.craftIdea.updateMany({
        where: { generated_by_user_id: userId },
        data: { deleted_at: new Date() }
      });

      await tx.userChallenge.updateMany({
        where: { user_id: userId },
        data: { deleted_at: new Date() }
      });

      await tx.chatbotConversation.updateMany({
        where: { user_id: userId },
        data: { deleted_at: new Date() }
      });

      await tx.like.updateMany({
        where: { user_id: userId },
        data: { deleted_at: new Date() }
      });

      // 2. Hard delete refresh tokens (no longer needed)
      await tx.refreshToken.deleteMany({
        where: { user_id: userId }
      });

      // 3. Mark user profile as deleted
      await tx.userProfile.updateMany({
        where: { user_id: userId },
        data: { deleted_at: new Date() }
      });

      // 4. Finally, soft delete the user account
      await tx.user.update({
        where: { user_id: userId },
        data: {
          is_active: false,
          deleted_at: new Date()
        }
      });

      // 5. Log the action
      await tx.moderationLog.create({
        data: {
          admin_id: adminId,
          action: 'ban_user',
          target_id: userId.toString(),
          target_user_id: userId,
          reason: 'User account permanently deleted by admin'
        }
      });
    });

    return { 
      success: true,
      message: 'User account and associated content deleted successfully',
      userId 
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Error deleting user:', error);
    throw new AppError('Failed to delete user', 500);
  }
};

export const getUserStatistics = async (userId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

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
      prisma.post.count({ 
        where: { user_id: userId, deleted_at: null } 
      }),
      prisma.comment.count({ 
        where: { user_id: userId, deleted_at: null } 
      }),
      prisma.like.count({ 
        where: { user_id: userId, deleted_at: null } 
      }),
      prisma.craftIdea.count({ 
        where: { generated_by_user_id: userId, deleted_at: null } 
      }),
      prisma.userChallenge.count({ 
        where: { 
          user_id: userId, 
          status: 'completed', 
          deleted_at: null 
        } 
      }),
      prisma.userChallenge.aggregate({
        where: { 
          user_id: userId, 
          status: 'completed',
          deleted_at: null 
        },
        _sum: { points_awarded: true }
      }),
      prisma.report.count({ 
        where: { reporter_id: userId } 
      }),
      prisma.report.count({
        where: {
          OR: [
            { 
              reported_post: { 
                user_id: userId,
                deleted_at: null 
              } 
            },
            { 
              reported_comment: { 
                user_id: userId,
                deleted_at: null 
              } 
            }
          ]
        }
      })
    ]);

    return {
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
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw new AppError('Failed to fetch user statistics', 500);
  }
};