// apps/mobile/src/screens/quest/UserChallenges.tsx - FIXED VERSION
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserChallengesHeader } from '~/components/quest/challenges/ChallengeHeader';
import { ChallengeTab, QuestType } from '~/components/quest/challenges/ChallengeTab';
import { EcoQuestStackParamList } from '~/navigations/types';
import { ChallengeList } from '~/components/quest/challenges/ChallengeList';
import { useUserChallenges, UserChallengeStatus } from '~/hooks/queries/useUserChallenges';

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

  // ✅ FIX: Transform data and ensure challenge_id is passed correctly
  const transformedChallenges = userChallenges.map(userChallenge => {
    // ✅ CRITICAL: Extract the actual challenge_id from the nested challenge object
    const challengeId = userChallenge.challenge?.challenge_id || userChallenge.challenge_id;
    
    console.log('🔄 Transforming user challenge:', {
      user_challenge_id: userChallenge.user_challenge_id,
      challenge_id_from_relation: userChallenge.challenge?.challenge_id,
      challenge_id_from_root: userChallenge.challenge_id,
      final_challenge_id: challengeId,
      title: userChallenge.challenge?.title
    });

    return {
      id: userChallenge.user_challenge_id, // This is the user_challenge_id (for list key)
      challenge_id: challengeId, // ✅ NEW: Pass the actual challenge_id separately
      title: userChallenge.challenge?.title || 'No title',
      description: userChallenge.challenge?.description || 'No description',
      completedAt: userChallenge.completed_at || userChallenge.verified_at,
      points: userChallenge.challenge?.points_reward,
      status: userChallenge.status,
    };
  });

  // ✅ FIX: Log the transformed data
  console.log('📊 Transformed challenges count:', transformedChallenges.length);
  if (transformedChallenges.length > 0) {
    console.log('📊 First transformed challenge:', transformedChallenges[0]);
  }

  const handleTabChange = (tab: QuestType) => {
    console.log('📑 Tab changed to:', tab);
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    console.log('🔄 Refreshing user challenges...');
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