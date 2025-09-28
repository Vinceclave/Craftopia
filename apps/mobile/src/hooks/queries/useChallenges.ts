import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "~/services/base.service";
import { API_ENDPOINTS } from "~/config/api";
import { useAuth } from "~/context/AuthContext";

interface Challenge {
  challenge_id: number;
  title: string;
  description: string;
  points_reward: number;
  category: string;
  material_type: string;
  source: string;
  is_active: boolean;
  created_at: string;
  expire_at?: string;
  _count?: { participants: number };
  participantCount?: number;
  participants?: number;
  isJoined?: boolean;
}

interface UserChallenge {
  user_challenge_id: number;
  challenge_id: number;
  user_id: number;
  status: 'in_progress' | 'pending_verification' | 'completed' | 'rejected';
  proof_url?: string;
  description?: string;
  points?: number;
  verified_at?: string;
  completedAt?: string;
  created_at: string;
  challenge?: Challenge;
}

export const challengeKeys = {
  all: ['challenges'] as const,
  lists: () => [...challengeKeys.all, 'list'] as const,
  list: (category?: string) => [...challengeKeys.lists(), category] as const,
  details: () => [...challengeKeys.all, 'detail'] as const,
  detail: (id: number) => [...challengeKeys.details(), id] as const,
  userChallenges: (userId: number) => ['userChallenges', userId] as const,
};

const normalizeChallenge = (challenge: any): Challenge => ({
  challenge_id: challenge.challenge_id || challenge.id,
  title: challenge.title || 'No title',
  description: challenge.description || 'No description',
  points_reward: Number(challenge.points_reward || challenge.points || 0),
  category: challenge.category || 'Other',
  material_type: challenge.material_type || 'General',
  source: challenge.source || 'System',
  is_active: challenge.is_active ?? true,
  created_at: challenge.created_at || new Date().toISOString(),
  expire_at: challenge.expire_at,
  participantCount: challenge.participantCount || challenge._count?.participants || challenge.participants || 0,
  isJoined: challenge.isJoined || false,
});


// Get challenges
export const useChallenges = (category?: string) => {
  return useQuery({
    queryKey: challengeKeys.list(category),
    queryFn: async () => {
      const params = category && category !== 'all' ? { category } : {};
      const response: { data?: Challenge[]; challenges?: Challenge[] } = await apiService.request(API_ENDPOINTS.CHALLENGES.LIST, { params });
      
      // Handle different response structures
      let challenges: any[] = [];
      if (Array.isArray(response)) {
        challenges = response;
      } else if (response.data && Array.isArray(response.data)) {
        challenges = response.data;
      } else if (response.challenges && Array.isArray(response.challenges)) {
        challenges = response.challenges;
      }
      
      return challenges.map(normalizeChallenge);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single challenge
export const useChallenge = (challengeId: number) => {
  
  return useQuery({
    queryKey: challengeKeys.detail(challengeId),
    queryFn: async () => {
      const response: { data?: Challenge; challenge: Challenge} = await apiService.request(API_ENDPOINTS.CHALLENGES.BY_ID(challengeId));
      const challengeData = response.data || response;
      return normalizeChallenge(challengeData);
    },
    enabled: !!challengeId,
    staleTime: 5 * 60 * 1000,
  });
};

export type { Challenge, UserChallenge };