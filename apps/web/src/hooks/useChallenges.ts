// apps/web/src/hooks/useChallenges.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI } from '../lib/api';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from './useToast';

interface ChallengeFilters {
  category: string;
  page: number;
  limit: number;
}

export const useChallenges = () => {
  const [filters, setFilters] = useState<ChallengeFilters>({
    category: '',
    page: 1,
    limit: 10,
  });

  const queryClient = useQueryClient();
  const { error: errorToast } = useToast();

  // Fetch challenges
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['challenges', filters.category],
    queryFn: async () => {
      try {
        const response = await challengesAPI.getAll(filters.category);
        return {
          data: response?.data ?? [],
          success: response?.success ?? true,
        };
      } catch (err) {
        throw err;
      }
    },
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Fetch pending verifications
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: async () => {
      try {
        const response = await challengesAPI.getPendingVerifications();
        return {
          data: response?.data ?? [],
          success: response?.success ?? true,
        };
      } catch {
        return { data: [], success: false };
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      const response = await challengesAPI.create(challengeData);
      return response?.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });
      const previousChallenges = queryClient.getQueryData(['challenges', filters.category]);
      return { previousChallenges };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx?.previousChallenges) {
        queryClient.setQueryData(['challenges', filters.category], ctx.previousChallenges);
      }
      errorToast(err?.message || 'Failed to create challenge');
    },
  });

  // AI Generate
  const generateAIMutation = useMutation({
    mutationFn: async (category: 'daily' | 'weekly' | 'monthly') => {
      const response = await challengesAPI.generateAI(category);
      return response?.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });
      const previousChallenges = queryClient.getQueryData(['challenges', filters.category]);
      return { previousChallenges };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx?.previousChallenges) {
        queryClient.setQueryData(['challenges', filters.category], ctx.previousChallenges);
      }
      errorToast(err?.message || 'Failed to generate AI challenge');
    },
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ challengeId, data: updateData }: { challengeId: number; data: any }) => {
      const response = await challengesAPI.update(challengeId, updateData);
      return response?.data;
    },
    onMutate: async ({ challengeId, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });

      const previousData = queryClient.getQueryData(['challenges', filters.category]);

      if (previousData && typeof previousData === 'object' && 'data' in previousData) {
        queryClient.setQueryData(['challenges', filters.category], {
          ...previousData,
          data: (previousData.data as any[]).map((challenge: any) =>
            challenge.challenge_id === challengeId
              ? { ...challenge, ...updateData }
              : challenge
          ),
        });
      }

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(['challenges', filters.category], ctx.previousData);
      }
      errorToast(err?.message || 'Failed to update challenge');
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      await challengesAPI.delete(challengeId);
      return challengeId;
    },
    onMutate: async (challengeId) => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });

      const previousData = queryClient.getQueryData(['challenges', filters.category]);

      if (previousData && typeof previousData === 'object' && 'data' in previousData) {
        queryClient.setQueryData(['challenges', filters.category], {
          ...previousData,
          data: (previousData.data as any[]).filter(
            (challenge: any) => challenge.challenge_id !== challengeId
          ),
        });
      }

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: any, _id, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(['challenges', filters.category], ctx.previousData);
      }
      errorToast(err?.message || 'Failed to delete challenge');
    },
  });

  // Toggle
  const toggleStatusMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await challengesAPI.toggleStatus(challengeId);
      return response?.data;
    },
    onMutate: async (challengeId) => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });

      const previousData = queryClient.getQueryData(['challenges', filters.category]);

      if (previousData && typeof previousData === 'object' && 'data' in previousData) {
        queryClient.setQueryData(['challenges', filters.category], {
          ...previousData,
          data: (previousData.data as any[]).map((challenge: any) =>
            challenge.challenge_id === challengeId
              ? { ...challenge, is_active: !challenge.is_active }
              : challenge
          ),
        });
      }

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: any, _id, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(['challenges', filters.category], ctx.previousData);
      }
      errorToast(err?.message || 'Failed to toggle status');
    },
  });

  // Filter handlers
  const setCategory = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: '',
      page: 1,
      limit: 10,
    });
  }, []);

  // Computed
  const challenges = useMemo(() => data?.data || [], [data?.data]);
  const pendingVerifications = useMemo(() => pendingData?.data || [], [pendingData?.data]);

  const stats = useMemo(() => {
    const list = Array.isArray(challenges) ? challenges : [];
    const pendingList = Array.isArray(pendingVerifications) ? pendingVerifications : [];

    return {
      total: list.length,
      active: list.filter((c: any) => c.is_active).length,
      aiGenerated: list.filter((c: any) => c.source === 'ai').length,
      adminCreated: list.filter((c: any) => c.source === 'admin').length,
      pending: pendingList.length,
    };
  }, [challenges, pendingVerifications]);

  return {
    challenges,
    pendingVerifications,
    stats,
    isLoading: isLoading || isPendingLoading,
    isFetching,
    error,

    category: filters.category,
    page: filters.page,
    limit: filters.limit,

    setCategory,
    setPage,
    setLimit,
    resetFilters,

    refetch: () => {
      refetch();
      refetchPending();
    },
    refetchPending,

    createChallenge: createMutation.mutateAsync,
    updateChallenge: updateMutation.mutateAsync,
    deleteChallenge: deleteMutation.mutateAsync,
    generateAIChallenge: generateAIMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGenerating: generateAIMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isAnyMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      generateAIMutation.isPending ||
      toggleStatusMutation.isPending,

    isPendingLoading,
  };
};
