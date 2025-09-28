// apps/mobile/src/screens/quest/UserChallenges.tsx
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserChallengesHeader } from '~/components/quest/challenges/ChallengeHeader';
import { ChallengeTab, QuestType } from '~/components/quest/challenges/ChallengeTab';
import { EcoQuestStackParamList } from '~/navigations/types';
import { ChallengeList } from '~/components/quest/challenges/ChallengeList';
import { useUserChallenges, UserChallengeStatus } from '~/hooks/queries/useUserChallenges';
import { RefreshControl } from 'react-native';

// Map UI tabs to API status values
const statusMap: Record<QuestType, UserChallengeStatus> = {
  'in_progress': 'in_progress',
  'pending_verification': 'pending_verification',
  'rejected': 'rejected',
  'completed': 'completed',
};

export const UserChallengesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
  const [activeTab, setActiveTab] = useState<QuestType>('in_progress');

  // Get user challenges for the selected status
  const { 
    data: userChallenges = [], 
    isLoading, 
    error,
    refetch 
  } = useUserChallenges(statusMap[activeTab]);

  // Transform data for the ChallengeList component
  const transformedChallenges = userChallenges.map(userChallenge => ({
    id: userChallenge.user_challenge_id,
    title: userChallenge.challenge?.title || 'No title',
    description: userChallenge.challenge?.description || 'No description',
    completedAt: userChallenge.completed_at || userChallenge.verified_at,
    points: userChallenge.challenge?.points_reward,
    status: userChallenge.status,
  }));

  const handleTabChange = (tab: QuestType) => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
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
        loading={isLoading}
        error={error?.message}
        onRefresh={handleRefresh}
        refreshing={false}
        onRetry={handleRefresh}
      />
    </SafeAreaView>
  );
};