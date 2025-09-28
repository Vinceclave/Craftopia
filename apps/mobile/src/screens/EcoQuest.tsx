import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QuestHeader } from '~/components/quest/QuestHeader';
import { QuestBanner } from '~/components/quest/QuestBanner';
import { Achievements } from '~/components/quest/Achievements';
import { QuestTabs } from '~/components/quest/QuestTabs';
import { QuestList } from '~/components/quest/QuestList';
import { useChallenges, useJoinChallenge } from '~/hooks/queries/useChallenges';
import { EcoQuestStackParamList } from '~/navigations/types';

type QuestType = 'all' | 'daily' | 'weekly' | 'monthly';

export const EcoQuestScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
  const [activeTab, setActiveTab] = useState<QuestType>('all');

  // TanStack Query hooks
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
  

  console.log(challenges)

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-craftopia-light">
      <QuestHeader navigation={navigation} />
      <QuestBanner />
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