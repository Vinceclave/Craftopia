import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserChallengesHeader } from '~/components/quest/challenges/ChallengeHeader';
import { ChallengeTab, QuestType } from '~/components/quest/challenges/ChallengeTab';
import { API_ENDPOINTS } from '~/config/api';
import { useAuth } from '~/context/AuthContext';
import { EcoQuestStackParamList } from '~/navigations/types';
import { apiService } from '~/services/base.service';
import { ChallengeList } from '~/components/quest/challenges/ChallengeList';

interface Challenge {
  id: number | string;
  title: string;
  description: string;
  completedAt?: string;
}

export const UserChallengesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
  const route = useRoute<RouteProp<EcoQuestStackParamList, 'UserChallenges'>>();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<QuestType>('in_progress');

  const fetchData = async (tab: QuestType) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await apiService.request(
        `${API_ENDPOINTS.USER_CHALLENGES.USER_LIST(user.id)}?status=${tab}`,
        { method: 'GET' }
      );

      // Normalize API response
      const normalized: Challenge[] = (response.data || []).map((item: any, index: number) => ({
        id: item.user_challenge_id || item.challenge_id || index, // safe fallback
        title: item.challenge?.title || 'No title',
        description: item.challenge?.description || 'No description',
        completedAt: item.completedAt,
      }));

      setChallenges(normalized);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [user?.id, activeTab]);

  console.log(challenges)
  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
      {/* Header */}
      <UserChallengesHeader navigation={navigation} />

      {/* Tabs */}
      <ChallengeTab activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Challenges List */}
      <ChallengeList challenges={challenges} loading={loading} />
    </SafeAreaView>
  );
};
