import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QuestHeader } from '~/components/quest/QuestHeader';
import { QuestBanner } from '~/components/quest/QuestBanner';
import { Achievements } from '~/components/quest/Achievements';
import { QuestTabs } from '~/components/quest/QuestTabs';
import { QuestList } from '~/components/quest/QuestList';
import { useChallenges } from '~/hooks/queries/useChallenges';
import { EcoQuestStackParamList } from '~/navigations/types';
import { useUserStats } from '~/hooks/useUserStats';

type QuestType = 'all' | 'daily' | 'weekly' | 'monthly';

export const EcoQuestScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
  const [activeTab, setActiveTab] = useState<QuestType>('all');

  // User stats query
  const { 
    data: userStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useUserStats();

  // Challenges query
  const { 
    data: challenges = [], 
    isLoading, 
    error, 
    refetch,
    isRefetching 
  } = useChallenges(activeTab);

  const handleJoin = (challengeId: number) => {
    navigation.navigate('QuestDetails', { questId: challengeId });
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-craftopia-light">
      <QuestHeader navigation={navigation} />

      {/* Fixed: use userStats and statsLoading here */}
      <QuestBanner data={userStats} loading={statsLoading} />

      <Achievements />

      <QuestTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <QuestList
        challenges={challenges}
        loading={isLoading}
        refreshing={isRefetching}
        error={error?.message || null}
        onRefresh={handleRefresh}
        onJoin={handleJoin}
        onRetry={handleRefresh}
      />
    </SafeAreaView>
  );
};
