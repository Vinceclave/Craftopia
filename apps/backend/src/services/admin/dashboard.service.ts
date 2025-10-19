// apps/backend/src/services/admin/dashboard.service.ts

import prisma from "../../config/prisma";
import { AppError } from "../../utils/error";
import { subDays, startOfDay, endOfDay } from "date-fns";

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
    inReview: number;
    resolved: number;
  };
  engagement: {
    totalLikes: number;
    avgPostsPerUser: number;
    avgChallengesPerUser: number;
  };
}

export interface ActivityLog {
  date: string;
  users: number;
  posts: number;
  challenges: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const sevenDaysAgo = subDays(today, 7);

  try {
    // Users stats
    const [totalUsers, activeUsers, newUsersToday, newUsersWeek, verifiedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.user.count({ where: { created_at: { gte: startOfToday } } }),
      prisma.user.count({ where: { created_at: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { is_email_verified: true } })
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
      prisma.report.count(),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.report.count({ where: { status: 'in_review' } }),
      prisma.report.count({ where: { status: 'resolved' } })
    ]);

    // Engagement stats
    const totalLikes = await prisma.like.count({ where: { deleted_at: null } });
    const avgPostsPerUser = totalUsers > 0 ? totalPosts / totalUsers : 0;
    const avgChallengesPerUser = totalUsers > 0 ? completedChallenges / totalUsers : 0;

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
        inReview: inReviewReports,
        resolved: resolvedReports
      },
      engagement: {
        totalLikes,
        avgPostsPerUser: Number(avgPostsPerUser.toFixed(2)),
        avgChallengesPerUser: Number(avgChallengesPerUser.toFixed(2))
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new AppError('Failed to fetch dashboard statistics', 500);
  }
};

export const getActivityLogs = async (days: number = 7): Promise<ActivityLog[]> => {
  if (days < 1 || days > 90) {
    throw new AppError('Days must be between 1 and 90', 400);
  }

  try {
    const activityData: ActivityLog[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const [users, posts, challenges] = await Promise.all([
        prisma.user.count({
          where: { created_at: { gte: dayStart, lte: dayEnd } }
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

    return activityData;
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw new AppError('Failed to fetch activity logs', 500);
  }
};

export const getTopUsers = async (limit: number = 10) => {
  if (limit < 1 || limit > 50) {
    throw new AppError('Limit must be between 1 and 50', 400);
  }

  try {
    const users = await prisma.userProfile.findMany({
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

    // Fetch filtered counts separately
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

    return usersWithCounts;
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw new AppError('Failed to fetch top users', 500);
  }
};

export const getRecentActivity = async (limit: number = 20) => {
  if (limit < 1 || limit > 100) {
    throw new AppError('Limit must be between 1 and 100', 400);
  }

  try {
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

    return {
      recentPosts,
      recentChallenges,
      recentReports
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw new AppError('Failed to fetch recent activity', 500);
  }
};
