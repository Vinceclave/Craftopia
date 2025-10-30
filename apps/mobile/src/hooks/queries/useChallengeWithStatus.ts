// apps/mobile/src/hooks/queries/useChallengeWithStatus.ts
import { useChallenge } from './useChallenges';
import { useUserChallengeProgress } from './useUserChallenges';

/**
 * Enhanced hook that combines challenge data with user's join status
 */
export const useChallengeWithStatus = (challengeId: number) => {
  // Get challenge details
  const challengeQuery = useChallenge(challengeId);
  
  // Get user's progress/join status
  const progressQuery = useUserChallengeProgress(challengeId);

  return {
    // Challenge data
    challenge: challengeQuery.data,
    challengeLoading: challengeQuery.isLoading,
    challengeError: challengeQuery.error,
    
    // User progress data
    userProgress: progressQuery.data,
    progressLoading: progressQuery.isLoading,
    progressError: progressQuery.error,
    
    // Combined states
    isLoading: challengeQuery.isLoading || progressQuery.isLoading,
    error: challengeQuery.error || progressQuery.error,
    
    // User status
    hasJoined: !!progressQuery.data,
    isCompleted: progressQuery.data?.status === 'completed',
    isPending: progressQuery.data?.status === 'pending_verification',
    isRejected: progressQuery.data?.status === 'rejected',
    isInProgress: progressQuery.data?.status === 'in_progress',
    
    // Refetch functions
    refetchChallenge: challengeQuery.refetch,
    refetchProgress: progressQuery.refetch,
    refetchAll: () => {
      challengeQuery.refetch();
      progressQuery.refetch();
    },
  };
};