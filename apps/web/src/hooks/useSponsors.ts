// apps/web/src/hooks/useSponsors.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sponsorsAPI, rewardsAPI, redemptionsAPI } from '../lib/api';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from './useToast';

// ==========================================
// SPONSORS HOOK
// ==========================================

export const useSponsors = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [activeOnly, setActiveOnly] = useState(false);

  const queryClient = useQueryClient();
  const { error: errorToast, success: successToast } = useToast();

  // Fetch sponsors
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['sponsors', page, limit, activeOnly],
    queryFn: async () => {
      try {
        const response = await sponsorsAPI.getAll(page, limit, activeOnly);
        return {
          data: response?.data?.data ?? [],
          meta: response?.data?.meta ?? { total: 0, page: 1, limit: 10, lastPage: 1 },
          success: response?.success ?? true,
        };
      } catch (err) {
        throw err;
      }
    },
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: async (sponsorData: any) => {
      const response = await sponsorsAPI.create(sponsorData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      successToast('Sponsor created successfully!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to create sponsor');
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ sponsorId, data: updateData }: { sponsorId: number; data: any }) => {
      const response = await sponsorsAPI.update(sponsorId, updateData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      successToast('Sponsor updated successfully!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to update sponsor');
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (sponsorId: number) => {
      await sponsorsAPI.delete(sponsorId);
      return sponsorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      successToast('Sponsor deleted successfully!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to delete sponsor');
    },
  });

  // Toggle
  const toggleStatusMutation = useMutation({
    mutationFn: async (sponsorId: number) => {
      const response = await sponsorsAPI.toggleStatus(sponsorId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      successToast('Sponsor status updated!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to toggle status');
    },
  });

  const sponsors = useMemo(() => data?.data || [], [data?.data]);
  const meta = useMemo(() => data?.meta, [data?.meta]);

  return {
    sponsors,
    meta,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    activeOnly,
    setPage,
    setLimit,
    setActiveOnly,
    refetch,
    createSponsor: createMutation.mutateAsync,
    updateSponsor: updateMutation.mutateAsync,
    deleteSponsor: deleteMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
  };
};

// ==========================================
// REWARDS HOOK
// ==========================================

export const useRewards = (filters?: {
  sponsor_id?: number;
  activeOnly?: boolean;
  availableOnly?: boolean;
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const queryClient = useQueryClient();
  const { error: errorToast, success: successToast } = useToast();

  // Fetch rewards
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['rewards', page, limit, filters],
    queryFn: async () => {
      try {
        const response = await rewardsAPI.getAll(page, limit, filters);
        return {
          data: response?.data?.data ?? [],
          meta: response?.data?.meta ?? { total: 0, page: 1, limit: 20, lastPage: 1 },
          success: response?.success ?? true,
        };
      } catch (err) {
        throw err;
      }
    },
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      const response = await rewardsAPI.create(rewardData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      successToast('Reward created successfully!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to create reward');
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ rewardId, data: updateData }: { rewardId: number; data: any }) => {
      const response = await rewardsAPI.update(rewardId, updateData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      successToast('Reward updated successfully!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to update reward');
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      await rewardsAPI.delete(rewardId);
      return rewardId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      successToast('Reward deleted successfully!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to delete reward');
    },
  });

  // Toggle
  const toggleStatusMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const response = await rewardsAPI.toggleStatus(rewardId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      successToast('Reward status updated!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to toggle status');
    },
  });

  // Redeem (for users)
  const redeemMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const response = await rewardsAPI.redeem(rewardId);
      return response?.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      successToast(`Reward redeemed! ${result.remaining_points} points remaining`);
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to redeem reward');
    },
  });

  const rewards = useMemo(() => data?.data || [], [data?.data]);
  const meta = useMemo(() => data?.meta, [data?.meta]);

  return {
    rewards,
    meta,
    isLoading,
    isFetching,
    error,
    page,
    limit,
    setPage,
    setLimit,
    refetch,
    createReward: createMutation.mutateAsync,
    updateReward: updateMutation.mutateAsync,
    deleteReward: deleteMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    redeemReward: redeemMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isRedeeming: redeemMutation.isPending,
  };
};

// ==========================================
// REDEMPTIONS HOOK
// ==========================================

export const useRedemptions = (filters?: {
  userId?: number;
  status?: 'pending' | 'fulfilled' | 'cancelled';
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const queryClient = useQueryClient();
  const { error: errorToast, success: successToast } = useToast();

  // Fetch redemptions
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['redemptions', page, limit, filters],
    queryFn: async () => {
      try {
        const response = await redemptionsAPI.getAll(page, limit, filters);
        return {
          data: response?.data?.data ?? [],
          meta: response?.data?.meta ?? { total: 0, page: 1, limit: 20, lastPage: 1 },
          success: response?.success ?? true,
        };
      } catch (err) {
        throw err;
      }
    },
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fulfill
  const fulfillMutation = useMutation({
    mutationFn: async (redemptionId: number) => {
      const response = await redemptionsAPI.fulfill(redemptionId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      successToast('Redemption fulfilled successfully!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to fulfill redemption');
    },
  });

  // Cancel
  const cancelMutation = useMutation({
    mutationFn: async ({ redemptionId, refundPoints }: { redemptionId: number; refundPoints?: boolean }) => {
      const response = await redemptionsAPI.cancel(redemptionId, refundPoints);
      return response?.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      if (result.refunded) {
        successToast(`Redemption cancelled. ${result.refund_amount} points refunded.`);
      } else {
        successToast('Redemption cancelled.');
      }
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to cancel redemption');
    },
  });

  // Stats
  const {
    data: statsData,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['sponsor-stats'],
    queryFn: async () => {
      const response = await redemptionsAPI.getStats();
      return response?.data;
    },
    staleTime: 60000,
  });

  const redemptions = useMemo(() => data?.data || [], [data?.data]);
  const meta = useMemo(() => data?.meta, [data?.meta]);
  const stats = useMemo(() => statsData, [statsData]);

  return {
    redemptions,
    meta,
    stats,
    isLoading,
    isFetching,
    statsLoading,
    error,
    page,
    limit,
    setPage,
    setLimit,
    refetch,
    fulfillRedemption: fulfillMutation.mutateAsync,
    cancelRedemption: cancelMutation.mutateAsync,
    isFulfilling: fulfillMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
};

// ==========================================
// COMBINED SPONSOR MANAGEMENT HOOK
// ==========================================

export const useSponsorManagement = () => {
  const sponsorsHook = useSponsors();
  const rewardsHook = useRewards();
  const redemptionsHook = useRedemptions();

  return {
    sponsors: sponsorsHook,
    rewards: rewardsHook,
    redemptions: redemptionsHook,
    isLoading: sponsorsHook.isLoading || rewardsHook.isLoading || redemptionsHook.isLoading,
  };
};