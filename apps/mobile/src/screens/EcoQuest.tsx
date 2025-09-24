// EcoQuestScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Achievements } from '~/components/quest/Achievements';
import { QuestBanner } from '~/components/quest/QuestBanner';
import { QuestHeader } from '~/components/quest/QuestHeader';
import { QuestList } from '~/components/quest/QuestList';
import { QuestTabs } from '~/components/quest/QuestTabs';
import { API_ENDPOINTS } from '~/config/api';
import { apiService } from '~/services/base.service';

type QuestType = 'all' | 'daily' | 'weekly' | 'monthly';

export const EcoQuestScreen = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<QuestType>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (tab: QuestType = 'all') => {
    try {
      setLoading(true); // Start loading
      const response = await apiService.request(API_ENDPOINTS.CHALLENGES.LIST, {
        params: {
          category: tab !== 'all' ? tab : undefined,
        },
      });

      const fetchedChallenges = Array.isArray(response.data?.data)
        ? response.data.data
        : response.data?.challenges || response.data || [];

      setChallenges(fetchedChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      <QuestHeader />

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        style={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <QuestBanner />
        <Achievements />
        <QuestTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        <QuestList challenges={challenges} loading={loading} />
        <View className="h-2" />
      </ScrollView>
    </SafeAreaView>
  );
};
