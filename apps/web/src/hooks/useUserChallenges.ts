// apps/web/src/hooks/useUserChallenges.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI } from '../lib/api';
import { useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';

type StatusFilter = 'all' | 'in_progress' | 'pending_verification' | 'completed' | 'rejected';

interface UserChallengeFilters {
  status: StatusFilter;
  page: number;
  limit: number;
  userId?: number;
}

export const useUserChallenges = () => {
  const [filters, setFilters] = useState<UserChallengeFilters>({
    status: 'all',
    page: 1,
    limit: 100,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all user challenges (Admin)
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-user-challenges', filters.status, filters.userId],
    queryFn: async () => {
      try {
        const apiFilters: any = {};
        if (filters.status !== 'all') {
          apiFilters.status = filters.status;
        }
        if (filters.userId) {
          apiFilters.userId = filters.userId;
        }
        
        const response = await challengesAPI.getAllUserChallenges(
          filters.page,
          filters.limit,
          apiFilters
        );
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

  // Manual verify mutation
  const verifyMutation = useMutation({
    mutationFn: async ({
      userChallengeId,
      approved,
      notes,
    }: {
      userChallengeId: number;
      approved: boolean;
      notes?: string;
    }) => {
      const response = await challengesAPI.manualVerify(userChallengeId, approved, notes);
      return response?.data;
    },
    onSuccess: (_, variables) => {
       toast({
        title: 'Success',
        description: `${variables.approved ? 'Challenge approved!' : 'Challenge rejected'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['pending-verifications'] });
    },
    onError: (err: any) => {
       toast({
        title: 'Error',
        description:  err?.message || 'Failed to verify challenge',
        variant: 'destructive',
      });
    },
  });

  // Filter handlers
  const setStatus = useCallback((status: StatusFilter) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setUserId = useCallback((userId: number | undefined) => {
    setFilters((prev) => ({ ...prev, userId, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      status: 'all',
      page: 1,
      limit: 100,
    });
  }, []);

  // Computed values
  const userChallenges = useMemo(() => {
    if (Array.isArray(data?.data)) {
      return data.data;
    } else if (data && typeof data === 'object' && 'data' in data) {
      return (data as any).data ?? [];
    }
    return [];
  }, [data]);

  const stats = useMemo(() => {
    const list = userChallenges;

    return {
      total: list.length,
      inProgress: list.filter((uc: any) => uc.status === 'in_progress').length,
      pending: list.filter((uc: any) => uc.status === 'pending_verification').length,
      completed: list.filter((uc: any) => uc.status === 'completed').length,
      rejected: list.filter((uc: any) => uc.status === 'rejected').length,
    };
  }, [userChallenges]);

  return {
    userChallenges,
    stats,
    isLoading,
    isFetching,
    error,

    status: filters.status,
    userId: filters.userId,
    page: filters.page,
    limit: filters.limit,

    setStatus,
    setUserId,
    setPage,
    setLimit,
    resetFilters,

    refetch,

    verifyChallenge: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
  };
};