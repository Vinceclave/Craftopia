// apps/mobile/src/hooks/queries/useRewards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardService } from '~/services/reward.service';
import { useAlert } from '~/hooks/useAlert';

/**
 * Hook to fetch available rewards
 */
export const useRewards = (
  page: number = 1,
  limit: number = 20,
  filters?: {
    sponsor_id?: number;
    activeOnly?: boolean;
    availableOnly?: boolean;
  }
) => {
  return useQuery({
    queryKey: ['rewards', page, limit, filters],
    queryFn: () => rewardService.getRewards(page, limit, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch single reward by ID
 */
export const useReward = (rewardId: number) => {
  return useQuery({
    queryKey: ['reward', rewardId],
    queryFn: () => rewardService.getRewardById(rewardId),
    enabled: !!rewardId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to redeem a reward
 */
export const useRedeemReward = () => {
  const queryClient = useQueryClient();
  const { success, error } = useAlert();

  return useMutation({
    mutationFn: (rewardId: number) => rewardService.redeemReward(rewardId),
    onSuccess: (response) => {
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['my-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      
      success(
        'Reward Redeemed!',
        `You've successfully redeemed this reward! Your new balance: ${response.data.newPoints} points`
      );
    },
    onError: (err: any) => {
      console.error('❌ Redeem error:', err);
      const errorMessage = err.message || 'Failed to redeem reward';
      error('Redemption Failed', errorMessage);
    },
  });
};

/**
 * Hook to fetch user's redemption history
 */
export const useMyRedemptions = (
  page: number = 1,
  limit: number = 20,
  status?: 'pending' | 'fulfilled' | 'cancelled'
) => {
  return useQuery({
    queryKey: ['my-redemptions', page, limit, status],
    queryFn: () => rewardService.getMyRedemptions(page, limit, status),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch sponsors
 */
export const useSponsors = (
  page: number = 1,
  limit: number = 10,
  activeOnly: boolean = true
) => {
  return useQuery({
    queryKey: ['sponsors', page, limit, activeOnly],
    queryFn: () => rewardService.getSponsors(page, limit, activeOnly),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};