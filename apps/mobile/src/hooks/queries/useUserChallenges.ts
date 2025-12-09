// apps/mobile/src/hooks/queries/useUserChallenges.ts - COMPLETE FIXED VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '~/services/base.service';
import { API_ENDPOINTS } from '~/config/api';
import { useAuth } from '~/context/AuthContext';

export type UserChallengeStatus = 'in_progress' | 'pending_verification' | 'completed' | 'rejected';

export interface UserChallenge {
  user_challenge_id: number;
  challenge_id: number;
  user_id: number;
  status: UserChallengeStatus;
  proof_url?: string;
  description?: string;
  points?: number;
  waste_kg_saved: number;
  verified_at?: string;
  completed_at?: string;
  created_at: string;
  challenge?: {
    challenge_id: number;
    title: string;
    description: string;
    points_reward: number;
    waste_kg: number;
    category: string;
    material_type: string;
  };
}

export interface QuestProgress {
  user_challenge_id: number;
  challenge_id: number;
  status: UserChallengeStatus;
  proof_url?: string;
  waste_kg_saved: number;
  verified_at?: string;
  created_at: string;
}

// Query keys
export const userChallengeKeys = {
  all: ['userChallenges'] as const,
  lists: () => [...userChallengeKeys.all, 'list'] as const,
  list: (userId: number, status?: UserChallengeStatus) => [...userChallengeKeys.lists(), userId, status] as const,
  details: () => [...userChallengeKeys.all, 'detail'] as const,
  detail: (challengeId: number, userId: number) => [...userChallengeKeys.details(), challengeId, userId] as const,
  progress: (challengeId: number, userId: number) => [...userChallengeKeys.all, 'progress', challengeId, userId] as const,
  wasteStats: (userId: number) => [...userChallengeKeys.all, 'wasteStats', userId] as const,
};

/**
 * ✅ COMPLETE FIX: Get user challenges by status
 */
export const useUserChallenges = (status?: UserChallengeStatus) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: userChallengeKeys.list(user?.id || 0, status),
    queryFn: async (): Promise<UserChallenge[]> => {
      
      if (!user?.id) {
        console.error('❌ [useUserChallenges] User not authenticated');
        throw new Error('User not authenticated');
      }
      
      try {
        // Build URL with status query param if provided
        const params = status ? `?status=${status}` : '';
        const url = `${API_ENDPOINTS.USER_CHALLENGES.USER_LIST}${params}`;
        
        // Make API request
        const response: any = await apiService.request(url, { 
          method: 'GET' 
        });

        // Handle different response formats
        let challenges = [];
        
        if (Array.isArray(response)) {
          challenges = response;
        } else if (response?.data && Array.isArray(response.data)) {
          challenges = response.data;
        } else if (response?.data) {
          challenges = [response.data];
        } else {
          challenges = [];
        }

        // Transform challenges
        const transformedChallenges = challenges.map((item: any, index: number) => {
          const transformed: UserChallenge = {
            user_challenge_id: item.user_challenge_id || item.id,
            challenge_id: item.challenge_id,
            user_id: item.user_id,
            status: item.status,
            proof_url: item.proof_url || undefined,
            description: item.description || undefined,
            points: item.points_awarded || item.points || 0,
            waste_kg_saved: Number(item.waste_kg_saved || 0),
            verified_at: item.verified_at || undefined,
            completed_at: item.completed_at || item.completedAt || undefined,
            created_at: item.created_at,
            challenge: item.challenge ? {
              challenge_id: item.challenge.challenge_id || item.challenge.id,
              title: item.challenge.title || 'Untitled Challenge',
              description: item.challenge.description || 'No description available',
              points_reward: item.challenge.points_reward || item.challenge.points || 0,
              waste_kg: Number(item.challenge.waste_kg || 0),
              category: item.challenge.category || 'Other',
              material_type: item.challenge.material_type || 'mixed',
            } : undefined,
          };

          return transformed;
        });

        return transformedChallenges;

      } catch (error: any) {
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Get user's progress for a specific challenge
 */
export const useUserChallengeProgress = (challengeId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: userChallengeKeys.progress(challengeId, user?.id || 0),
    queryFn: async (): Promise<QuestProgress | null> => {
      if (!user?.id || !challengeId) {
        return null;
      }

      try {
        const url = API_ENDPOINTS.USER_CHALLENGES.BY_CHALLENGE_ID(challengeId);

        const response: any = await apiService.request(url, { method: 'GET' });

        const data = response.data || response;
        
        if (!data) {
          return null;
        }

        return {
          user_challenge_id: data.user_challenge_id,
          challenge_id: data.challenge_id,
          status: data.status,
          proof_url: data.proof_url,
          waste_kg_saved: Number(data.waste_kg_saved || 0),
          verified_at: data.verified_at,
          created_at: data.created_at,
        };
      } catch (error: any) {
        if (error.message?.includes('404') || 
            error.message?.includes('not found') ||
            error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user?.id && !!challengeId,
    staleTime: 1 * 60 * 1000,
    gcTime: 3 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || 
          error?.message?.includes('404') || 
          error?.message?.includes('not found')) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Get user's waste statistics
 */
export const useUserWasteStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: userChallengeKeys.wasteStats(user?.id || 0),
    queryFn: async () => {
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const response: any = await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.WASTE_STATS,
        { method: 'GET' }
      );

      return response.data || response;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Join a challenge
 */
export const useJoinChallenge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (challengeId: number) => {
      
      const response = await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.JOIN,
        {
          method: 'POST',
          data: { challenge_id: challengeId },
        }
      );
      
      return response;
    },
    onSuccess: (data, challengeId) => {
      
      queryClient.invalidateQueries({ 
        queryKey: userChallengeKeys.lists() 
      });
      
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: userChallengeKeys.progress(challengeId, user.id) 
        });
      }
      
      queryClient.invalidateQueries({ 
        queryKey: ['challenges', 'detail', challengeId] 
      });
    },
    onError: (error: any) => {
      console.error('❌ [useJoinChallenge] Error:', error);
    },
  });
};

/**
 * Submit challenge verification
 */
export const useSubmitChallengeVerification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      userChallengeId: number;
      proofUrl: string;
      description?: string;
      points?: number;
      challengeId: number;
    }) => {

      const response = await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.VERIFY(params.userChallengeId),
        {
          method: 'POST',
          data: {
            proof_url: params.proofUrl,
            description: params.description || '',
            points: params.points || 0,
            challenge_id: params.challengeId,
            userId: user?.id,
          },
        }
      );

      return response;
    },
    onSuccess: (data, variables) => {
      
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: userChallengeKeys.progress(variables.challengeId, user.id) 
        });
        
        queryClient.refetchQueries({ 
          queryKey: userChallengeKeys.progress(variables.challengeId, user.id) 
        });

        queryClient.invalidateQueries({
          queryKey: userChallengeKeys.wasteStats(user.id)
        });
      }
      
      queryClient.invalidateQueries({ 
        queryKey: userChallengeKeys.lists() 
      });
    },
    onError: (error: any) => {
      console.error('❌ [useSubmitChallengeVerification] Error:', error);
    },
  });
};

/**
 * Skip a challenge
 */
export const useSkipChallenge = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      userChallengeId: number;
      reason?: string;
    }) => {
      
      const response = await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.SKIP(params.userChallengeId),
        {
          method: 'POST',
          data: { reason: params.reason },
        }
      );
      
      return response;
    },
    onSuccess: () => {
      
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: userChallengeKeys.lists() 
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ [useSkipChallenge] Error:', error);
    },
  });
};