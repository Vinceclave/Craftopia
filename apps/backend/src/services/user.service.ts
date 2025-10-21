// apps/backend/src/services/user.service.ts - REFACTORED VERSION
import prisma from "../config/prisma";
import { User } from "../generated/prisma";
import { BaseService } from "./base.service";
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError,
  handlePrismaError 
} from "../utils/error";

class UserService extends BaseService {
  // Create user
  async createUser(username: string, email: string, password_hash: string): Promise<User> {
    this.validateRequiredString(username, 'Username', 3, 30);
    this.validateRequiredString(email, 'Email');
    this.validateRequiredString(password_hash, 'Password hash');

    try {
      return await prisma.user.create({
        data: { username, email, password_hash },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('Username or email already exists');
      }
      throw handlePrismaError(error);
    }
  }

  // Find user by username or email
  async findUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    if (!usernameOrEmail?.trim()) return null;

    return prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      },
    });
  }

  // Find user by ID
  async findUserById(userId: number): Promise<User | null> {
    this.validateId(userId, 'User ID');
    return prisma.user.findUnique({ where: { user_id: userId } });
  }

  // Mark user as verified
  async markUserAsVerified(userId: number): Promise<User> {
    this.validateId(userId, 'User ID');

    const user = await this.checkResourceExists(
      prisma.user,
      { user_id: userId },
      'User'
    );

    if (user.is_email_verified) {
      throw new ValidationError('Email is already verified');
    }

    return prisma.user.update({
      where: { user_id: userId },
      data: { is_email_verified: true },
    });
  }

  // Get user profile
  async getUserProfile(userId: number) {
    this.validateId(userId, 'User ID');

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        role: true,
        is_email_verified: true,
        created_at: true,
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  // Update user profile
  async updateUserProfile(
    userId: number,
    data: {
      full_name?: string;
      bio?: string;
      profile_picture_url?: string;
      home_dashboard_layout?: object | null;
    }
  ) {
    this.validateId(userId, 'User ID');

    // Validate bio length if provided
    if (data.bio !== undefined) {
      this.validateRequiredString(data.bio, 'Bio', 0, 500);
    }

    return await prisma.userProfile.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        full_name: data.full_name || null,
        bio: data.bio?.trim() || null,
        profile_picture_url: data.profile_picture_url || null,
        home_dashboard_layout: (data.home_dashboard_layout ?? null) as any,
      },
      update: {
        full_name: data.full_name || undefined,
        bio: data.bio?.trim() || undefined,
        profile_picture_url: data.profile_picture_url || undefined,
        home_dashboard_layout: (data.home_dashboard_layout ?? undefined) as any,
      },
      include: {
        user: {
          select: { user_id: true, username: true, email: true }
        }
      }
    });
  }

  // Get public user profile
  async getPublicUserProfile(userId: number) {
    this.validateId(userId, 'User ID');

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        created_at: true,
        profile: {
          select: {
            bio: true,
            profile_picture_url: true,
            points: true,
          },
        },
        _count: {
          select: {
            craftIdeas: { where: { deleted_at: null } },
            posts: { where: { deleted_at: null } },
            userChallenges: { where: { status: 'completed' } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  // Get user stats
  async getUserStats(userId: number) {
    this.validateId(userId, 'User ID');

    const [profile, craftsCount, postsCount, challengesCompleted, totalPoints] = await Promise.all([
      prisma.userProfile.findUnique({ where: { user_id: userId } }),
      prisma.craftIdea.count({ 
        where: { generated_by_user_id: userId, deleted_at: null } 
      }),
      prisma.post.count({ 
        where: { user_id: userId, deleted_at: null } 
      }),
      prisma.userChallenge.count({ 
        where: { user_id: userId, status: 'completed' } 
      }),
      prisma.userChallenge.aggregate({
        where: { user_id: userId, status: 'completed' },
        _sum: { points_awarded: true },
      }),
    ]);

    return {
      points: profile?.points ?? 0,
      crafts_created: craftsCount,
      posts_created: postsCount,
      challenges_completed: challengesCompleted,
      total_points_earned: totalPoints._sum.points_awarded ?? 0,
    };
  }

  // Get points leaderboard
  async getPointsLeaderboard(page = 1, limit = 10) {
    const result = await this.paginate<any>(prisma.userProfile, {
      page,
      limit,
      orderBy: { points: 'desc' },
      where: {
        deleted_at: null,
        user: {
          deleted_at: null,
          is_active: true
        }
      }
    });

    // Transform the data
    const transformedData = result.data.map((profile: any, index: number) => ({
      rank: (page - 1) * limit + index + 1,
      user_id: profile.user_id,
      points: profile.points ?? 0,
      profile_picture_url: profile.profile_picture_url ?? null,
    }));

    return {
      data: transformedData,
      meta: result.meta
    };
  }
}

// Export singleton instance
export const userService = new UserService();

// Export individual functions for backward compatibility
export const createUser = userService.createUser.bind(userService);
export const findUserByUsernameOrEmail = userService.findUserByUsernameOrEmail.bind(userService);
export const findUserById = userService.findUserById.bind(userService);
export const markUserAsVerified = userService.markUserAsVerified.bind(userService);
export const getUserProfile = userService.getUserProfile.bind(userService);
export const updateUserProfile = userService.updateUserProfile.bind(userService);
export const getPublicUserProfile = userService.getPublicUserProfile.bind(userService);
export const getUserStats = userService.getUserStats.bind(userService);
export const getPointsLeaderboard = userService.getPointsLeaderboard.bind(userService);