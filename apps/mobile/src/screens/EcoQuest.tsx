// screens/EcoQuestScreen.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QuestHeader } from '~/components/quest/QuestHeader';
import { QuestBanner } from '~/components/quest/QuestBanner';
import { Achievements } from '~/components/quest/Achievements';
import { QuestTabs } from '~/components/quest/QuestTabs';
import { QuestList } from '~/components/quest/QuestList';

import { API_ENDPOINTS } from '~/config/api';
import { apiService } from '~/services/base.service';
import { EcoQuestStackParamList } from '~/navigations/types';

type QuestType = 'all' | 'daily' | 'weekly' | 'monthly';

interface Challenge {
  challenge_id: number;
  title: string;
  description: string;
  points_reward: number;
  category: string;
  material_type: string;
  source: string;
  is_active: boolean;
  _count: { participants: number };
}

interface ApiResponse {
  data?: {
    data?: Challenge[];
    challenges?: Challenge[];
  } | Challenge[];
  challenges?: Challenge[];
}

export const EcoQuestScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<QuestType>('all');
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to extract challenges from different response structures
  const extractChallenges = (response: ApiResponse): Challenge[] => {
    // Handle direct array response
    if (Array.isArray(response)) {
      return response;
    }

    // Handle nested data structures
    const data = response?.data;
    if (Array.isArray(data)) {
      return data;
    }

    // Handle data.data or data.challenges
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data.challenges)) {
        return data.challenges;
      }
    }

    // Handle top-level challenges
    if (Array.isArray(response?.challenges)) {
      return response.challenges;
    }

    return [];
  };

  const fetchChallenges = async (tab: QuestType = 'all', isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = tab !== 'all' ? { category: tab } : {};
      const response = await apiService.request(API_ENDPOINTS.CHALLENGES.LIST, { params });
      
      const fetchedChallenges = extractChallenges(response);
      setChallenges(fetchedChallenges);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load challenges';
      setError(errorMessage);
      setChallenges([]);
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges(activeTab);
  }, [activeTab]);

  const handleRefresh = () => {
    fetchChallenges(activeTab, true);
  };

  const handleJoinChallenge = (challengeId: number) => {
    navigation.navigate('QuestDetails', { questId: challengeId });
  };

  const handleRetry = () => {
    fetchChallenges(activeTab);
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-craftopia-light">
      <QuestHeader navigation={navigation} />
      <QuestBanner />
      <Achievements />
      <QuestTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <QuestList
        challenges={challenges}
        loading={loading}
        refreshing={refreshing}
        error={error}
        onRefresh={handleRefresh}
        onJoin={handleJoinChallenge}
        onRetry={handleRetry}
      />
    </SafeAreaView>
  );
};