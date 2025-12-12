// apps/backend/src/services/admin/dashboard.service.ts - REFACTORED COMPLETE VERSION

import prisma from "../../config/prisma";
import { BaseService } from "../base.service";
import { AppError, ValidationError } from "../../utils/error";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { logger } from "../../utils/logger";

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    verified: number;
  };
  content: {
    totalPosts: number;
    totalComments: number;
    totalCrafts: number;
    postsToday: number;
  };
  challenges: {
    total: number;
    active: number;
    completed: number;
    pendingVerification: number;
  };
  reports: {
    total: number;
    pending: number;
    in_review: number;
    resolved: number;
  };
  engagement: {
    totalLikes: number;
    avgPostsPerUser: number;
    avgChallengesPerUser: number;
    average: number;
    sessions: number;
  };
  sponsorship: {
    sponsors: {
      total: number;
      active: number;
    };
    rewards: {
      total: number;
      active: number;
    };
    redemptions: {
      total: number;
      pending: number;
      fulfilled: number;
      cancelled: number;
      totalPointsRedeemed: number;
    };
  };
  materials: {
    name: string;
    count: number;
  }[];
}

export interface ActivityLog {
  date: string;
  users: number;
  posts: number;
  challenges: number;
}

class DashboardService extends BaseService {
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const sevenDaysAgo = subDays(today, 7);

    try {
      logger.debug('Fetching dashboard statistics');

      // Users stats
      const [totalUsers, activeUsers, newUsersToday, newUsersWeek, verifiedUsers] = await Promise.all([
        prisma.user.count({ where: { deleted_at: null } }),
        prisma.user.count({ where: { is_active: true, deleted_at: null } }),
        prisma.user.count({ where: { created_at: { gte: startOfToday }, deleted_at: null } }),
        prisma.user.count({ where: { created_at: { gte: sevenDaysAgo }, deleted_at: null } }),
        prisma.user.count({ where: { is_email_verified: true, deleted_at: null } })
      ]);

      // Content stats
      const [totalPosts, totalComments, totalCrafts, postsToday] = await Promise.all([
        prisma.post.count({ where: { deleted_at: null } }),
        prisma.comment.count({ where: { deleted_at: null } }),
        prisma.craftIdea.count({ where: { deleted_at: null } }),
        prisma.post.count({
          where: {
            deleted_at: null,
            created_at: { gte: startOfToday }
          }
        })
      ]);

      // Challenge stats
      const [totalChallenges, activeChallenges, completedChallenges, pendingVerification] = await Promise.all([
        prisma.ecoChallenge.count({ where: { deleted_at: null } }),
        prisma.ecoChallenge.count({ where: { is_active: true, deleted_at: null } }),
        prisma.userChallenge.count({ where: { status: 'completed', deleted_at: null } }),
        prisma.userChallenge.count({
          where: {
            status: 'pending_verification',
            deleted_at: null
          }
        })
      ]);

      // Report stats
      const [totalReports, pendingReports, inReviewReports, resolvedReports] = await Promise.all([
        prisma.report.count({ where: { deleted_at: null } }),
        prisma.report.count({ where: { status: 'pending', deleted_at: null } }),
        prisma.report.count({ where: { status: 'in_review', deleted_at: null } }),
        prisma.report.count({ where: { status: 'resolved', deleted_at: null } })
      ]);

      // Sponsorship stats
      const [
        totalSponsors,
        activeSponsors,
        totalRewards,
        activeRewards,
        totalRedemptions,
        pendingRedemptions,
        fulfilledRedemptions,
        cancelledRedemptions
      ] = await Promise.all([
        prisma.sponsor.count({ where: { deleted_at: null } }),
        prisma.sponsor.count({ where: { deleted_at: null, is_active: true } }),
        prisma.sponsorReward.count({ where: { deleted_at: null } }),
        prisma.sponsorReward.count({ where: { deleted_at: null, is_active: true } }),
        prisma.userRedemption.count({ where: { deleted_at: null } }),
        prisma.userRedemption.count({ where: { deleted_at: null, status: 'pending' } }),
        prisma.userRedemption.count({ where: { deleted_at: null, status: 'fulfilled' } }),
        prisma.userRedemption.count({ where: { deleted_at: null, status: 'cancelled' } })
      ]);

      // Calculate total points redeemed from fulfilled redemptions
      const redeemedRewards = await prisma.userRedemption.findMany({
        where: { deleted_at: null, status: 'fulfilled' },
        select: { reward: { select: { points_cost: true } } }
      });
      const totalPointsRedeemed = redeemedRewards.reduce(
        (sum, r) => sum + (r.reward?.points_cost || 0),
        0
      );

      // Engagement stats
      const totalLikes = await prisma.like.count({ where: { deleted_at: null } });

      const avgPostsPerUser = totalUsers > 0 ? totalPosts / totalUsers : 0;
      const avgChallengesPerUser = totalUsers > 0 ? completedChallenges / totalUsers : 0;
      const avgEngagement = totalPosts > 0 ? (totalLikes + totalComments) / totalPosts : 0;

      const activeSessions = await prisma.user.count({
        where: {
          is_active: true,
          deleted_at: null,
          updated_at: { gte: subDays(today, 1) }
        }
      });

      // Material stats
      const craftsWithMaterials = await prisma.craftIdea.findMany({
        where: { deleted_at: null },
        select: { recycled_materials: true }
      });

      const materialCounts: Record<string, number> = {};
      craftsWithMaterials.forEach(craft => {
        const materials = this.extractStringArray(craft.recycled_materials);
        materials.forEach(material => {
          if (material) {
            // Clean material name using regex
            // 1. Remove content in parentheses (e.g., "(1)")
            // 2. Remove "x" followed by numbers or numbers followed by "x"
            // 3. Remove digits
            // 4. Remove special characters except spaces
            let cleaned = material.replace(/\s*\([^)]*\)/g, '');
            cleaned = cleaned.replace(/^\d+\s*x\s*/i, '').replace(/\s*x\s*\d+$/i, '');
            cleaned = cleaned.replace(/[0-9]/g, '');
            cleaned = cleaned.replace(/[^\w\s]/g, ' ');

            // Normalize whitespace and case
            cleaned = cleaned.replace(/\s+/g, ' ').trim().toLowerCase();

            if (cleaned.length > 1) { // Ignore single characters
              materialCounts[cleaned] = (materialCounts[cleaned] || 0) + 1;
            }
          }
        });
      });

      const topMaterials = Object.entries(materialCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 materials

      logger.info('Dashboard statistics fetched successfully');

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersWeek,
          verified: verifiedUsers
        },
        content: {
          totalPosts,
          totalComments,
          totalCrafts,
          postsToday
        },
        challenges: {
          total: totalChallenges,
          active: activeChallenges,
          completed: completedChallenges,
          pendingVerification
        },
        reports: {
          total: totalReports,
          pending: pendingReports,
          in_review: inReviewReports,
          resolved: resolvedReports
        },
        engagement: {
          totalLikes,
          avgPostsPerUser: Number(avgPostsPerUser.toFixed(2)),
          avgChallengesPerUser: Number(avgChallengesPerUser.toFixed(2)),
          average: Number(avgEngagement.toFixed(2)),
          sessions: activeSessions
        },
        sponsorship: {
          sponsors: {
            total: totalSponsors,
            active: activeSponsors
          },
          rewards: {
            total: totalRewards,
            active: activeRewards
          },
          redemptions: {
            total: totalRedemptions,
            pending: pendingRedemptions,
            fulfilled: fulfilledRedemptions,
            cancelled: cancelledRedemptions,
            totalPointsRedeemed
          }
        },
        materials: topMaterials
      };
    } catch (error) {
      logger.error('Error fetching dashboard stats', error);
      throw new AppError('Failed to fetch dashboard statistics', 500);
    }
  }

  async getActivityLogs(days: number = 7): Promise<ActivityLog[]> {
    if (days < 1 || days > 90) {
      throw new ValidationError('Days must be between 1 and 90');
    }

    try {
      logger.debug('Fetching activity logs', { days });

      const activityData: ActivityLog[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const [users, posts, challenges] = await Promise.all([
          prisma.user.count({
            where: {
              created_at: { gte: dayStart, lte: dayEnd },
              deleted_at: null
            }
          }),
          prisma.post.count({
            where: {
              created_at: { gte: dayStart, lte: dayEnd },
              deleted_at: null
            }
          }),
          prisma.userChallenge.count({
            where: {
              created_at: { gte: dayStart, lte: dayEnd },
              deleted_at: null
            }
          })
        ]);

        activityData.push({
          date: date.toISOString().split('T')[0],
          users,
          posts,
          challenges
        });
      }

      logger.info('Activity logs fetched successfully', { days, recordCount: activityData.length });

      return activityData;
    } catch (error) {
      logger.error('Error fetching activity logs', error);
      throw new AppError('Failed to fetch activity logs', 500);
    }
  }

  async getTopUsers(limit: number = 10) {
    if (limit < 1 || limit > 50) {
      throw new ValidationError('Limit must be between 1 and 50');
    }

    try {
      logger.debug('Fetching top users', { limit });

      const users = await prisma.userProfile.findMany({
        where: {
          deleted_at: null,
          user: {
            deleted_at: null,
            is_active: true
          }
        },
        take: limit,
        orderBy: { points: 'desc' },
        include: {
          user: {
            select: {
              user_id: true,
              username: true,
              email: true,
              created_at: true,
              is_active: true
            }
          }
        }
      });

      const usersWithCounts = await Promise.all(users.map(async (profile) => {
        const [postsCount, completedChallengesCount] = await Promise.all([
          prisma.post.count({
            where: { user_id: profile.user_id, deleted_at: null }
          }),
          prisma.userChallenge.count({
            where: { user_id: profile.user_id, status: 'completed', deleted_at: null }
          })
        ]);

        return {
          ...profile,
          counts: {
            posts: postsCount,
            completedChallenges: completedChallengesCount
          }
        };
      }));

      logger.info('Top users fetched successfully', { count: usersWithCounts.length });

      return usersWithCounts;
    } catch (error) {
      logger.error('Error fetching top users', error);
      throw new AppError('Failed to fetch top users', 500);
    }
  }

  async getRecentActivity(limit: number = 20) {
    if (limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    try {
      logger.debug('Fetching recent activity', { limit });

      const [recentPosts, recentChallenges, recentReports] = await Promise.all([
        prisma.post.findMany({
          take: limit,
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          select: {
            post_id: true,
            title: true,
            created_at: true,
            user: {
              select: { user_id: true, username: true }
            }
          }
        }),
        prisma.userChallenge.findMany({
          take: limit,
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          select: {
            user_challenge_id: true,
            status: true,
            created_at: true,
            user: {
              select: { user_id: true, username: true }
            },
            challenge: {
              select: { challenge_id: true, title: true }
            }
          }
        }),
        prisma.report.findMany({
          take: limit,
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          select: {
            report_id: true,
            status: true,
            reason: true,
            created_at: true,
            reporter: {
              select: { user_id: true, username: true }
            }
          }
        })
      ]);

      logger.info('Recent activity fetched successfully');

      return {
        recentPosts,
        recentChallenges,
        recentReports
      };
    } catch (error) {
      logger.error('Error fetching recent activity', error);
      throw new AppError('Failed to fetch recent activity', 500);
    }
  }

  private extractStringArray(jsonValue: any): string[] {
    if (!jsonValue) return [];
    if (Array.isArray(jsonValue)) {
      return jsonValue.filter((item): item is string => typeof item === 'string');
    }
    return [];
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

// Export individual functions for backward compatibility
export const getDashboardStats = dashboardService.getDashboardStats.bind(dashboardService);
export const getActivityLogs = dashboardService.getActivityLogs.bind(dashboardService);
export const getTopUsers = dashboardService.getTopUsers.bind(dashboardService);
export const getRecentActivity = dashboardService.getRecentActivity.bind(dashboardService);