// apps/mobile/src/hooks/useUserStats.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '~/services/user.service';
import { useAuth } from '~/context/AuthContext';

interface UserStats {
  points: number;
  crafts_created: number;
  posts_created: number;
  challenges_completed: number;
  total_points_earned: number;
}

// Query keys for user stats
export const userStatsKeys = {
  all: ['userStats'] as const,
  detail: (userId: number) => [...userStatsKeys.all, userId] as const,
};

/**
 * Hook to get current user's stats
 */
export const useUserStats = () => {
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: userStatsKeys.detail(user?.id || 0),
    queryFn: () => userService.getUserStats(),
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - previously cacheTime
    retry: (failureCount, error: any) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('401') || error?.message?.includes('unauthorized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to get specific user's stats by ID
 */
export const useUserStatsById = (userId: number) => {
  return useQuery({
    queryKey: userStatsKeys.detail(userId),
    queryFn: () => userService.getUserStats(), // You might need to modify this to accept userId
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export type { UserStats };