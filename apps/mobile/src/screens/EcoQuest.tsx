  import { useNavigation } from '@react-navigation/native';
  import { NativeStackNavigationProp } from '@react-navigation/native-stack';
  import React, { useEffect, useState } from 'react';
  import { ScrollView, View, ActivityIndicator, Text } from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { Achievements } from '~/components/quest/Achievements';
  import { QuestBanner } from '~/components/quest/QuestBanner';
  import { QuestHeader } from '~/components/quest/QuestHeader';
  import { QuestList } from '~/components/quest/QuestList';
  import { QuestTabs } from '~/components/quest/QuestTabs';
  import { API_ENDPOINTS } from '~/config/api';
  import { EcoQuestStackParamList } from '~/navigations/types';
  import { apiService } from '~/services/base.service';

  type QuestType = 'all' | 'daily' | 'weekly' | 'monthly';

  export const EcoQuestScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
    const [challenges, setChallenges] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<QuestType>('all');
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async (tab: QuestType = 'all') => {
      try {
        setLoading(true);
        const response = await apiService.request(API_ENDPOINTS.CHALLENGES.LIST, {
          params: { category: tab !== 'all' ? tab : undefined },
        });

        const fetchedChallenges = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.challenges || response.data || [];

        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchData(activeTab);
    }, [activeTab]);

    const handleJoinChallenge = (challengeId: number) => {
      navigation.navigate('QuestDetails', { questId: challengeId });
    };

    return (
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <QuestHeader navigation={navigation}/>
        <QuestBanner />
          <Achievements />
          <QuestTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
            <QuestList challenges={challenges} onJoin={handleJoinChallenge} loading={loading} />
          <View className="h-2" />
        </ScrollView>
      </SafeAreaView>
    );
  };
