// apps/web/src/hooks/useChallenges.ts - IMPROVED VERSION
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

  // Fetch challenges with proper error handling
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
        
        // Normalize response structure
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response from server');
        }

        return {
          data: response?.data ?? [],
          success: response?.success ?? true,
        };
      } catch (err) {
        console.error('Failed to fetch challenges:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30_000,
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
      } catch (err) {
        console.error('Failed to fetch pending verifications:', err);
        return { data: [], success: false };
      }
    },
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Create challenge mutation with optimistic updates
  const createMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      const response = await challengesAPI.create(challengeData);
      return response?.data;
    },
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['challenges'] });
      
      // Snapshot previous value
      const previousChallenges = queryClient.getQueryData(['challenges', filters.category]);
      
      return { previousChallenges };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (err: any, _variables, context) => {
      // Rollback on error
      if (context?.previousChallenges) {
        queryClient.setQueryData(['challenges', filters.category], context.previousChallenges);
      }
      errorToast(err?.message || 'Failed to create challenge');
    },
  });

  // Generate AI challenge mutation
  const generateAIMutation = useMutation({
    mutationFn: async (category: string) => {
      console.log('🤖 Generating AI challenge, category:', category);
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
    onError: (err: any, _variables, context) => {
      if (context?.previousChallenges) {
        queryClient.setQueryData(['challenges', filters.category], context.previousChallenges);
      }
      errorToast(err?.message || 'Failed to generate AI challenge');
    },
  });

  // Update challenge mutation
  const updateMutation = useMutation({
    mutationFn: async ({ challengeId, data: updateData }: { challengeId: number; data: any }) => {
      const response = await challengesAPI.update(challengeId, updateData);
      return response?.data;
    },
    onMutate: async ({ challengeId, data: updateData }) => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });
      
      const previousData = queryClient.getQueryData(['challenges', filters.category]);
      
      // Optimistically update
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
    onError: (err: any, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['challenges', filters.category], context.previousData);
      }
      errorToast(err?.message || 'Failed to update challenge');
    },
  });

  // Delete challenge mutation
  const deleteMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      await challengesAPI.delete(challengeId);
      return challengeId;
    },
    onMutate: async (challengeId) => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });
      
      const previousData = queryClient.getQueryData(['challenges', filters.category]);
      
      // Optimistically remove
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
    onError: (err: any, _challengeId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['challenges', filters.category], context.previousData);
      }
      errorToast(err?.message || 'Failed to delete challenge');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await challengesAPI.toggleStatus(challengeId);
      return response?.data;
    },
    onMutate: async (challengeId) => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });
      
      const previousData = queryClient.getQueryData(['challenges', filters.category]);
      
      // Optimistically toggle
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
    onError: (err: any, _challengeId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['challenges', filters.category], context.previousData);
      }
      errorToast(err?.message || 'Failed to toggle status');
    },
  });

  // Filter management
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

  // Computed values
  const challenges = useMemo(() => data?.data || [], [data?.data]);
  const pendingVerifications = useMemo(() => pendingData?.data || [], [pendingData?.data]);

  const stats = useMemo(() => {
    const challengeList = Array.isArray(challenges) ? challenges : [];
    const pendingList = Array.isArray(pendingVerifications) ? pendingVerifications : [];

    return {
      total: challengeList.length,
      active: challengeList.filter((c: any) => c.is_active).length,
      aiGenerated: challengeList.filter((c: any) => c.source === 'ai').length,
      adminCreated: challengeList.filter((c: any) => c.source === 'admin').length,
      pending: pendingList.length,
    };
  }, [challenges, pendingVerifications]);

  return {
    // Data
    challenges,
    pendingVerifications,
    stats,
    isLoading: isLoading || isPendingLoading,
    isFetching,
    error,
    
    // Filters
    category: filters.category,
    page: filters.page,
    limit: filters.limit,
    
    // Filter actions
    setCategory,
    setPage,
    setLimit,
    resetFilters,
    
    // Data actions
    refetch: () => {
      refetch();
      refetchPending();
    },
    refetchPending,
    
    // Mutations
    createChallenge: createMutation.mutateAsync,
    updateChallenge: updateMutation.mutateAsync,
    deleteChallenge: deleteMutation.mutateAsync,
    generateAIChallenge: generateAIMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGenerating: generateAIMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isAnyMutating: createMutation.isPending || 
                   updateMutation.isPending || 
                   deleteMutation.isPending || 
                   generateAIMutation.isPending ||
                   toggleStatusMutation.isPending,
    isPendingLoading,
  };
};