import prisma from "../config/prisma";
import { User } from "../generated/prisma";
import { AppError } from '../utils/error';

export const createUser = async (username: string, email: string, password_hash: string): Promise<User> => {
  try {
    return await prisma.user.create({
      data: { username, email, password_hash },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new AppError('Username or email already exists', 409);
    }
    throw new AppError('Failed to create user', 500);
  }
};

export const findUserByUsernameOrEmail = async (usernameOrEmail: string): Promise<User | null> => {
  if (!usernameOrEmail?.trim()) return null;
  
  return prisma.user.findFirst({
    where: { 
      OR: [
        { username: usernameOrEmail }, 
        { email: usernameOrEmail }
      ] 
    },
  });
};

export const findUserById = async (userId: number): Promise<User | null> => {
  if (!userId || userId <= 0) return null;
  
  return prisma.user.findUnique({
    where: { user_id: userId },
  });
};

export const markUserAsVerified = async (userId: number): Promise<User> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.is_email_verified) {
    throw new AppError('Email is already verified', 400);
  }

  return prisma.user.update({
    where: { user_id: userId },
    data: { is_email_verified: true },
  });
};

export const getUserProfile = async (userId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      username: true,
      email: true,
      role: true,
      is_email_verified: true,
      created_at: true,
      profile: true, // ✅ profile included here
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};


export const updateUserProfile = async (
  userId: number, 
  data: {
    full_name?: string;
    bio?: string;
    profile_picture_url?: string;
    home_dashboard_layout?: object | null; 
  }
) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  return await prisma.userProfile.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      full_name: data.full_name || null, // <-- use data.full_name
      bio: data.bio?.trim() || null,
      profile_picture_url: data.profile_picture_url || null,
      home_dashboard_layout: (data.home_dashboard_layout ?? null) as any, 
    },
    update: {
      full_name: data.full_name || undefined, // <-- use data.full_name
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
};



export const getPublicUserProfile = async (userId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

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
          craftIdeas: {
            where: { deleted_at: null },
          },
          posts: {
            where: { deleted_at: null },
          },
          userChallenges: {
            where: { status: 'completed' },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export const getUserStats = async (userId: number) => {
  if (!userId || userId <= 0) {
    throw new AppError('Invalid user ID', 400);
  }

  const [profile, craftsCount, postsCount, challengesCompleted, totalPoints] = await Promise.all([
    prisma.userProfile.findUnique({ where: { user_id: userId } }),
    prisma.craftIdea.count({ where: { generated_by_user_id: userId, deleted_at: null } }),
    prisma.post.count({ where: { user_id: userId, deleted_at: null } }),
    prisma.userChallenge.count({ where: { user_id: userId, status: 'completed' } }),
    prisma.userChallenge.aggregate({
      where: { user_id: userId, status: 'completed' },
      _sum: { points_awarded: true },
    }),
  ]);

  return {
    points: profile?.points ?? 0, // fallback if profile is missing
    crafts_created: craftsCount,
    posts_created: postsCount,
    challenges_completed: challengesCompleted,
    total_points_earned: totalPoints._sum.points_awarded ?? 0, // safe null handling
  };
};

export const getPointsLeaderboard = async (page = 1, limit = 10) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 50) limit = 10;

  const skip = (page - 1) * limit;

  const [profiles, total] = await Promise.all([
    prisma.userProfile.findMany({
      skip,
      take: limit,
      orderBy: { points: 'desc' },
      include: {
        user: {
          select: { user_id: true, username: true, created_at: true },
        },
      },
    }),
    prisma.userProfile.count(),
  ]);

  return {
    data: profiles.map((profile, index) => ({
      rank: skip + index + 1, // sequential ranking (not handling ties)
      user_id: profile.user.user_id,
      username: profile.user.username,
      points: profile.points ?? 0, // safety: null → 0
      profile_picture_url: profile.profile_picture_url ?? null,
      member_since: profile.user.created_at,
    })),
    meta: {
      total,
      page,
      lastPage: Math.max(1, Math.ceil(total / limit)), // avoid 0 lastPage
      limit,
    },
  };
};
