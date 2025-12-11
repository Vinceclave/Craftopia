// apps/web/src/hooks/useSponsors.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sponsorsAPI, rewardsAPI, redemptionsAPI } from '../lib/api';
import { useState, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';

// ==========================================
// SPONSORS HOOK
// ==========================================

export const useSponsors = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1000);
  const [activeOnly, setActiveOnly] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['sponsors', page, limit, activeOnly],
    queryFn: async () => {
      const response = await sponsorsAPI.getAll(page, limit, activeOnly);

      const sponsors = response?.data?.data || response?.data || [];
      const meta = response?.data?.meta || {
        total: Array.isArray(sponsors) ? sponsors.length : 0,
        page: 1,
        limit: 10,
        lastPage: 1,
      };

      return {
        data: Array.isArray(sponsors) ? sponsors : [],
        meta,
        success: response?.success ?? true,
      };
    },
    retry: 2,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: async (sponsorData: any) => {
      const response = await sponsorsAPI.create(sponsorData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
      toast({
        title: 'Success',
        description: 'Sponsor created successfully!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to create sponsor',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ sponsorId, data: updateData }: { sponsorId: number; data: any }) => {
      const response = await sponsorsAPI.update(sponsorId, updateData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
      toast({
        title: 'Success',
        description: 'Sponsor updated successfully!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update sponsor',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (sponsorId: number) => {
      await sponsorsAPI.delete(sponsorId);
      return sponsorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
      toast({
        title: 'Success',
        description: 'Sponsor deleted successfully!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete sponsor',
        variant: 'destructive',
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (sponsorId: number) => {
      const response = await sponsorsAPI.toggleStatus(sponsorId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.refetchQueries({ queryKey: ['sponsors'] });
      toast({
        title: 'Success',
        description: 'Sponsor status updated!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to toggle status',
        variant: 'destructive',
      });
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
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['rewards', page, limit, filters],
    queryFn: async () => {
      const response = await rewardsAPI.getAll(page, limit, filters);
      const rewards = response?.data?.data || response?.data || [];
      const meta = response?.data?.meta || {
        total: Array.isArray(rewards) ? rewards.length : 0,
        page: 1,
        limit: 20,
        lastPage: 1,
      };

      return {
        data: Array.isArray(rewards) ? rewards : [],
        meta,
        success: response?.success ?? true,
      };
    },
    retry: 2,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const createMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      const response = await rewardsAPI.create(rewardData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.refetchQueries({ queryKey: ['rewards'] });
      toast({
        title: 'Success',
        description: 'Reward created successfully!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to create reward',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ rewardId, data: updateData }: { rewardId: number; data: any }) => {
      const response = await rewardsAPI.update(rewardId, updateData);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.refetchQueries({ queryKey: ['rewards'] });
      toast({
        title: 'Success',
        description: 'Reward updated successfully!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update reward',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      await rewardsAPI.delete(rewardId);
      return rewardId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.refetchQueries({ queryKey: ['rewards'] });
      toast({
        title: 'Success',
        description: 'Reward deleted successfully!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete reward',
        variant: 'destructive',
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const response = await rewardsAPI.toggleStatus(rewardId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.refetchQueries({ queryKey: ['rewards'] });
      toast({
        title: 'Success',
        description: 'Reward status updated!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to toggle status',
        variant: 'destructive',
      });
    },
  });

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
      toast({
        title: 'Success',
        description: `Reward redeemed! ${remainingPoints} points remaining`,
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to redeem reward',
        variant: 'destructive',
      });
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
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['redemptions', page, limit, filters],
    queryFn: async () => {
      const response = await redemptionsAPI.getAll(page, limit, filters);
      const redemptions = response?.data?.data || response?.data || [];
      const meta = response?.data?.meta || {
        total: Array.isArray(redemptions) ? redemptions.length : 0,
        page: 1,
        limit: 20,
        lastPage: 1,
      };

      return {
        data: Array.isArray(redemptions) ? redemptions : [],
        meta,
        success: response?.success ?? true,
      };
    },
    retry: 2,
    staleTime: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const fulfillMutation = useMutation({
    mutationFn: async (redemptionId: number) => {
      const response = await redemptionsAPI.fulfill(redemptionId);
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.refetchQueries({ queryKey: ['redemptions'] });
      toast({
        title: 'Success',
        description: 'Redemption fulfilled successfully!',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to fulfill redemption',
        variant: 'destructive',
      });
    },
  });

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
        toast({
          title: 'Success',
          description: `Redemption cancelled. ${refundAmount} points refunded.`,
        });
      } else {
        toast({
          title: 'Success',
          description: 'Redemption cancelled.',
        });
      }
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to cancel redemption',
        variant: 'destructive',
      });
    },
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
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
    isLoading:
      sponsorsHook.isLoading ||
      rewardsHook.isLoading ||
      redemptionsHook.isLoading,
  };
};
