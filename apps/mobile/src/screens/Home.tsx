import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { CompositeNavigationProp } from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HomeHeader } from '~/components/home/HomeHeader'
import { HomeQuest, QuestProps } from '~/components/home/HomeQuest'
import { HomeStats } from '~/components/home/HomeStats'
import { API_ENDPOINTS } from '~/config/api'
import { EcoQuestStackParamList, HomeStackParamList, RootTabParamList } from '~/navigations/types'
import { apiService } from '~/services/base.service'
import { useAuth } from '~/context/AuthContext'

// Combine both navigation types to access tab navigation from stack screen
type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Home'>,
  BottomTabNavigationProp<RootTabParamList>
>;

interface HomeProps {
  username: string,
  points: number
}

export const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [dailyQuest, setDailyQuest] = useState<QuestProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);



  const fetchDailyQuest = async () => {
    try {
      setLoading(true);
      const response = await apiService.request(API_ENDPOINTS.CHALLENGES.LIST, {
        params: { category: 'daily' },
      });

      const quests: QuestProps[] = (response.data?.data || response.data || []).map((quest: any) => ({
        title: quest.title,
        description: quest.description,
        points: quest.points_reward,
        completed: quest.is_completed || false,
      }));

      setDailyQuest(quests);
    } catch (err: any) {
      console.error('Error fetching daily quests:', err);
      setDailyQuest([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeAllQuests = () => {
    // Navigate to the EcoQuest tab
    navigation.navigate('EcoQuestStack', { screen: 'EcoQuest' });
  };

  useEffect(() => {
    fetchDailyQuest();
  }, []);

  console.log(user)

  return (
    <SafeAreaView edges={['left', 'right']} className='flex-1 bg-craftopia-light'>
      <HomeHeader user={user}/>
      <HomeStats user={user} />
      <HomeQuest
          quests={dailyQuest} 
          loading={loading} 
          onSeeAllPress={handleSeeAllQuests}
      />
    </SafeAreaView>
  )
}