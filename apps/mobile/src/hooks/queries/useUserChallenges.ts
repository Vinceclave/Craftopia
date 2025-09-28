// apps/mobile/src/hooks/queries/useUserChallenges.ts
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
  verified_at?: string;
  completed_at?: string;
  created_at: string;
  challenge?: {
    challenge_id: number;
    title: string;
    description: string;
    points_reward: number;
    category: string;
    material_type: string;
  };
}

export interface QuestProgress {
  user_challenge_id: number;
  challenge_id: number;
  status: UserChallengeStatus;
  proof_url?: string;
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
};

/**
 * Get user challenges by status
 */
export const useUserChallenges = (status?: UserChallengeStatus) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: userChallengeKeys.list(user?.id || 0, status),
    queryFn: async (): Promise<UserChallenge[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const params = status ? `?status=${status}` : '';
      const response: any = await apiService.request(
        `${API_ENDPOINTS.USER_CHALLENGES.USER_LIST(user.id)}${params}`,
        { method: 'GET' }
      );

      // Normalize the response
      const challenges = response.data || response || [];
      return challenges.map((item: any) => ({
        user_challenge_id: item.user_challenge_id || item.id,
        challenge_id: item.challenge_id,
        user_id: item.user_id,
        status: item.status,
        proof_url: item.proof_url,
        description: item.description,
        points: item.points,
        verified_at: item.verified_at,
        completed_at: item.completed_at || item.completedAt,
        created_at: item.created_at,
        challenge: item.challenge ? {
          challenge_id: item.challenge.challenge_id || item.challenge.id,
          title: item.challenge.title || 'No title',
          description: item.challenge.description || 'No description',
          points_reward: item.challenge.points_reward || item.challenge.points || 0,
          category: item.challenge.category || 'Other',
          material_type: item.challenge.material_type || 'General',
        } : undefined,
      }));
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      if (!user?.id || !challengeId) return null;

      try {
        const response: any = await apiService.request(
          `${API_ENDPOINTS.USER_CHALLENGES.BY_CHALLENGE_ID(challengeId)}?user_id=${user.id}`,
          { method: 'GET' }
        );

        const data = response.data || response;
        if (!data) return null;

        return {
          user_challenge_id: data.user_challenge_id,
          challenge_id: data.challenge_id,
          status: data.status,
          proof_url: data.proof_url,
          verified_at: data.verified_at,
          created_at: data.created_at,
        };
      } catch (error: any) {
        // If user hasn't joined the challenge, return null instead of throwing
        if (error.message?.includes('404') || 
            error.message?.includes('not found') ||
            error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user?.id && !!challengeId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    retry: (failureCount, error: any) => {
      // Don't retry 404 errors (user hasn't joined challenge)
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
      // Invalidate and refetch user challenges
      queryClient.invalidateQueries({ 
        queryKey: userChallengeKeys.lists() 
      });
      
      // Invalidate challenge progress
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: userChallengeKeys.progress(challengeId, user.id) 
        });
      }
      
      // Invalidate the specific challenge details
      queryClient.invalidateQueries({ 
        queryKey: ['challenges', 'detail', challengeId] 
      });
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
            description: params.description,
            points: params.points,
            challenge_id: params.challengeId,
            userId: user?.id,
          },
        }
      );
      return response;
    },
    onSuccess: (data, variables) => {
      // Invalidate user challenges
      queryClient.invalidateQueries({ 
        queryKey: userChallengeKeys.lists() 
      });
      
      // Invalidate specific challenge progress
      if (user?.id) {
        queryClient.invalidateQueries({ 
          queryKey: userChallengeKeys.progress(variables.challengeId, user.id) 
        });
      }
    },
  });
};