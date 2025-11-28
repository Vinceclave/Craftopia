// apps/web/src/hooks/useSponsors.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sponsorsAPI, rewardsAPI, redemptionsAPI } from '../lib/api';
import { useState, useMemo } from 'react';
import { useToast } from './useToast';

// ==========================================
// SPONSORS HOOK
// ==========================================

export const useSponsors = () => {
  const [page, setPage] = useState(1);
   const [limit, setLimit] = useState(1000); // Instead of 10 or 20
  const [activeOnly, setActiveOnly] = useState(false);

  const queryClient = useQueryClient();
  const { error: errorToast, success: successToast } = useToast();

  // Fetch sponsors - FIXED
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
        console.log('📦 Sponsors API Response:', response);
        
        // Handle different response structures
        const sponsors = response?.data?.data || response?.data || [];
        const meta = response?.data?.meta || { 
          total: Array.isArray(sponsors) ? sponsors.length : 0, 
          page: 1, 
          limit: 10, 
          lastPage: 1 
        };
        
        console.log('✅ Parsed sponsors:', sponsors);
        console.log('✅ Parsed meta:', meta);
        
        return {
          data: Array.isArray(sponsors) ? sponsors : [],
          meta,
          success: response?.success ?? true,
        };
      } catch (err) {
        console.error('❌ Error fetching sponsors:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 5000, // Reduced to 5 seconds for immediate updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Create - FIXED
  const createMutation = useMutation({
    mutationFn: async (sponsorData: any) => {
      console.log('🚀 Creating sponsor:', sponsorData);
      const response = await sponsorsAPI.create(sponsorData);
      console.log('✅ Create response:', response);
      return response?.data;
    },
    onSuccess: (data) => {
      console.log('✅ Sponsor created successfully:', data);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
      successToast('Sponsor created successfully!');
    },
    onError: (err: any) => {
      console.error('❌ Create error:', err);
      errorToast(err?.message || 'Failed to create sponsor');
    },
  });

  // Update - FIXED
  const updateMutation = useMutation({
    mutationFn: async ({ sponsorId, data: updateData }: { sponsorId: number; data: any }) => {
      console.log('🔄 Updating sponsor:', sponsorId, updateData);
      const response = await sponsorsAPI.update(sponsorId, updateData);
      console.log('✅ Update response:', response);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
      successToast('Sponsor updated successfully!');
    },
    onError: (err: any) => {
      console.error('❌ Update error:', err);
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
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
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
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
      successToast('Sponsor status updated!');
    },
    onError: (err: any) => {
      errorToast(err?.message || 'Failed to toggle status');
    },
  });

  const sponsors = useMemo(() => {
    const result = data?.data || [];
    console.log('📊 Sponsors memoized:', result);
    return result;
  }, [data?.data]);
  
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

  // Fetch rewards - FIXED
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
        const rewards = response?.data?.data || response?.data || [];
        const meta = response?.data?.meta || { 
          total: Array.isArray(rewards) ? rewards.length : 0, 
          page: 1, 
          limit: 20, 
          lastPage: 1 
        };
        
        return {
          data: Array.isArray(rewards) ? rewards : [],
          meta,
          success: response?.success ?? true,
        };
      } catch (err) {
        throw err;
      }
    },
    retry: 2,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      const response = await rewardsAPI.create(rewardData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.refetchQueries({ queryKey: ['rewards'] });
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
      queryClient.refetchQueries({ queryKey: ['rewards'] });
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
      queryClient.refetchQueries({ queryKey: ['rewards'] });
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
      queryClient.refetchQueries({ queryKey: ['rewards'] });
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
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      const remainingPoints = result?.remaining_points ?? 'Unknown';
      successToast(`Reward redeemed! ${remainingPoints} points remaining`);
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
        const redemptions = response?.data?.data || response?.data || [];
        const meta = response?.data?.meta || { 
          total: Array.isArray(redemptions) ? redemptions.length : 0, 
          page: 1, 
          limit: 20, 
          lastPage: 1 
        };
        
        return {
          data: Array.isArray(redemptions) ? redemptions : [],
          meta,
          success: response?.success ?? true,
        };
      } catch (err) {
        throw err;
      }
    },
    retry: 2,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fulfill
  const fulfillMutation = useMutation({
    mutationFn: async (redemptionId: number) => {
      const response = await redemptionsAPI.fulfill(redemptionId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.refetchQueries({ queryKey: ['redemptions'] });
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
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.refetchQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      if (result?.refunded) {
        const refundAmount = result?.refund_amount ?? 0;
        successToast(`Redemption cancelled. ${refundAmount} points refunded.`);
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