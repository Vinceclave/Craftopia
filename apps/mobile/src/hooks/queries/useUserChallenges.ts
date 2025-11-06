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
      console.log('🚀 [useUserChallenges] Starting fetch...');
      console.log('👤 User:', { id: user?.id, username: user?.username });
      
      if (!user?.id) {
        console.error('❌ [useUserChallenges] User not authenticated');
        throw new Error('User not authenticated');
      }
      
      try {
        // Build URL with status query param if provided
        const params = status ? `?status=${status}` : '';
        const url = `${API_ENDPOINTS.USER_CHALLENGES.USER_LIST}${params}`;
        
        console.log('📡 [useUserChallenges] Fetching from:', url);
        console.log('🔑 [useUserChallenges] Status filter:', status || 'none');

        // Make API request
        const response: any = await apiService.request(url, { 
          method: 'GET' 
        });

        console.log('📦 [useUserChallenges] Raw response:', {
          responseType: typeof response,
          isArray: Array.isArray(response),
          hasData: !!response?.data,
          dataIsArray: Array.isArray(response?.data),
          keys: response ? Object.keys(response) : [],
        });

        // Handle different response formats
        let challenges = [];
        
        if (Array.isArray(response)) {
          console.log('✅ [useUserChallenges] Response is array');
          challenges = response;
        } else if (response?.data && Array.isArray(response.data)) {
          console.log('✅ [useUserChallenges] Response.data is array');
          challenges = response.data;
        } else if (response?.data) {
          console.log('⚠️ [useUserChallenges] Response.data is not array, wrapping');
          challenges = [response.data];
        } else {
          console.warn('⚠️ [useUserChallenges] Unexpected response format:', response);
          challenges = [];
        }

        console.log(`📊 [useUserChallenges] Found ${challenges.length} challenges`);

        // Log first item for debugging
        if (challenges.length > 0) {
          console.log('🔍 [useUserChallenges] First challenge raw:', {
            user_challenge_id: challenges[0].user_challenge_id,
            challenge_id: challenges[0].challenge_id,
            status: challenges[0].status,
            hasChallenge: !!challenges[0].challenge,
            challengeTitle: challenges[0].challenge?.title,
          });
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

          console.log(`🔄 [useUserChallenges] Transformed [${index}]:`, {
            user_challenge_id: transformed.user_challenge_id,
            challenge_id: transformed.challenge_id,
            title: transformed.challenge?.title,
            status: transformed.status,
          });

          return transformed;
        });

        console.log(`✅ [useUserChallenges] Returning ${transformedChallenges.length} transformed challenges`);
        return transformedChallenges;

      } catch (error: any) {
        console.error('❌ [useUserChallenges] Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
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
      console.log('🚀 [useUserChallengeProgress] Starting fetch...');
      console.log('🎯 Challenge ID:', challengeId);
      console.log('👤 User ID:', user?.id);

      if (!user?.id || !challengeId) {
        console.log('⚠️ [useUserChallengeProgress] Missing user or challenge ID');
        return null;
      }

      try {
        const url = API_ENDPOINTS.USER_CHALLENGES.BY_CHALLENGE_ID(challengeId);
        console.log('📡 [useUserChallengeProgress] Fetching from:', url);

        const response: any = await apiService.request(url, { method: 'GET' });

        const data = response.data || response;
        
        if (!data) {
          console.log('ℹ️ [useUserChallengeProgress] No progress found');
          return null;
        }

        console.log('✅ [useUserChallengeProgress] Progress found:', {
          user_challenge_id: data.user_challenge_id,
          status: data.status,
        });

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
          console.log('ℹ️ [useUserChallengeProgress] Challenge not joined (404)');
          return null;
        }
        console.error('❌ [useUserChallengeProgress] Error:', error);
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
      console.log('🚀 [useUserWasteStats] Fetching waste stats...');
      
      if (!user?.id) {
        console.error('❌ [useUserWasteStats] User not authenticated');
        throw new Error('User not authenticated');
      }

      const response: any = await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.WASTE_STATS,
        { method: 'GET' }
      );

      console.log('✅ [useUserWasteStats] Stats retrieved');
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
      console.log('🚀 [useJoinChallenge] Joining challenge:', challengeId);
      
      const response = await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.JOIN,
        {
          method: 'POST',
          data: { challenge_id: challengeId },
        }
      );
      
      console.log('✅ [useJoinChallenge] Successfully joined');
      return response;
    },
    onSuccess: (data, challengeId) => {
      console.log('🔄 [useJoinChallenge] Invalidating queries...');
      
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
      console.log('🚀 [useSubmitChallengeVerification] Submitting:', params);

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

      console.log('✅ [useSubmitChallengeVerification] Success:', response);
      return response;
    },
    onSuccess: (data, variables) => {
      console.log('🔄 [useSubmitChallengeVerification] Invalidating queries...');
      
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
      console.log('🚀 [useSkipChallenge] Skipping:', params);
      
      const response = await apiService.request(
        API_ENDPOINTS.USER_CHALLENGES.SKIP(params.userChallengeId),
        {
          method: 'POST',
          data: { reason: params.reason },
        }
      );
      
      console.log('✅ [useSkipChallenge] Success');
      return response;
    },
    onSuccess: () => {
      console.log('🔄 [useSkipChallenge] Invalidating queries...');
      
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