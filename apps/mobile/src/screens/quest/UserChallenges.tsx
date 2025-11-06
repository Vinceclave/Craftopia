// apps/mobile/src/screens/quest/UserChallenges.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserChallengesHeader } from '~/components/quest/challenges/ChallengeHeader';
import { ChallengeTab, QuestType } from '~/components/quest/challenges/ChallengeTab';
import { EcoQuestStackParamList } from '~/navigations/types';
import { ChallengeList } from '~/components/quest/challenges/ChallengeList';
import { useUserChallenges, UserChallengeStatus } from '~/hooks/queries/useUserChallenges';
import { useAuth } from '~/context/AuthContext';

// Map UI tabs to API status values
const statusMap: Record<QuestType, UserChallengeStatus> = {
  'in_progress': 'in_progress',
  'pending_verification': 'pending_verification',
  'rejected': 'rejected',
  'completed': 'completed',
};

export const UserChallengesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
  const { user } = useAuth();

  console.log(user)
  const [activeTab, setActiveTab] = useState<QuestType>('in_progress');
  const [refreshing, setRefreshing] = useState(false);

  console.log('🎬 [UserChallengesScreen] Rendering...');
  console.log('👤 [UserChallengesScreen] User:', { id: user?.id, username: user?.username });
  console.log('📑 [UserChallengesScreen] Active tab:', activeTab);

  // Get user challenges for the selected status
  const { 
    data: userChallenges = [], 
    isLoading, 
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useUserChallenges(statusMap[activeTab]);

  console.log('📊 [UserChallengesScreen] Query state:', {
    isLoading,
    isFetching,
    isRefetching,
    challengesCount: userChallenges.length,
    hasError: !!error,
    errorMessage: error?.message,
  });

  // Log data changes
  useEffect(() => {
    console.log('🔄 [UserChallengesScreen] Data updated:', {
      count: userChallenges.length,
      status: statusMap[activeTab],
    });
    
    if (userChallenges.length > 0) {
      console.log('📋 [UserChallengesScreen] First challenge:', {
        user_challenge_id: userChallenges[0].user_challenge_id,
        challenge_id: userChallenges[0].challenge_id,
        title: userChallenges[0].challenge?.title,
        status: userChallenges[0].status,
      });
    }
  }, [userChallenges, activeTab]);

  // Transform challenges for the list component
  const transformedChallenges = userChallenges.map((userChallenge) => {
    // Extract the actual challenge_id from nested challenge object
    const challengeId = userChallenge.challenge?.challenge_id || userChallenge.challenge_id;
    
    const transformed = {
      id: userChallenge.user_challenge_id, // For React key
      challenge_id: challengeId, // For navigation
      title: userChallenge.challenge?.title || 'Untitled Challenge',
      description: userChallenge.challenge?.description || 'No description',
      completedAt: userChallenge.completed_at || userChallenge.verified_at || null,
      points: userChallenge.challenge?.points_reward || 0,
      status: userChallenge.status,
    };

    return transformed;
  });

  console.log('🔄 [UserChallengesScreen] Transformed challenges:', {
    count: transformedChallenges.length,
    first: transformedChallenges[0] ? {
      id: transformedChallenges[0].id,
      challenge_id: transformedChallenges[0].challenge_id,
      title: transformedChallenges[0].title,
    } : 'none',
  });

  const handleTabChange = (tab: QuestType) => {
    console.log('📑 [UserChallengesScreen] Tab changed:', { from: activeTab, to: tab });
    setActiveTab(tab);
  };

  const handleRefresh = async () => {
    console.log('🔄 [UserChallengesScreen] Manual refresh triggered');
    setRefreshing(true);
    try {
      await refetch();
      console.log('✅ [UserChallengesScreen] Refresh complete');
    } catch (err) {
      console.error('❌ [UserChallengesScreen] Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
    console.log('🔄 [UserChallengesScreen] Retry triggered');
    refetch();
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      {/* Header */}
      <UserChallengesHeader navigation={navigation} />

      {/* Tabs */}
      <ChallengeTab activeTab={activeTab} onChangeTab={handleTabChange} />

      {/* Challenges List */}
      <ChallengeList 
        challenges={transformedChallenges} 
        loading={isLoading && !isRefetching}
        error={error?.message || null}
        onRefresh={handleRefresh}
        refreshing={refreshing || isRefetching}
        onRetry={handleRetry}
      />
    </SafeAreaView>
  );
};