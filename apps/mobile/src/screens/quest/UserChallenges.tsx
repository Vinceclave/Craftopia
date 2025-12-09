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

  const [activeTab, setActiveTab] = useState<QuestType>('in_progress');
  const [refreshing, setRefreshing] = useState(false);


  // Get user challenges for the selected status
  const { 
    data: userChallenges = [], 
    isLoading, 
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useUserChallenges(statusMap[activeTab]);


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

  const handleTabChange = (tab: QuestType) => {
    setActiveTab(tab);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('❌ [UserChallengesScreen] Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = () => {
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