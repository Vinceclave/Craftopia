// apps/mobile/src/screens/Home.tsx
import React from 'react';
import { ScrollView, Platform, View, RefreshControl } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '~/components/home/HomeHeader';
import { HomeStats } from '~/components/home/HomeStats';
import { HomeQuest } from '~/components/home/HomeQuest';
import { HomeActivity } from '~/components/home/HomeActivity';
import { useChallenges } from '~/hooks/queries/useChallenges';
import { useNavigation } from '@react-navigation/native';

const SafeAreaView = Platform.OS === 'web' ? View : RNSafeAreaView;

export const HomeScreen = () => {
  const { data: challenges = [], isLoading, refetch } = useChallenges('daily');
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSeeAllQuests = () => {
    navigation.navigate('EcoQuest');
  };

  const handleQuestPress = (quest) => {
    console.log('Quest pressed:', quest);
    navigation.navigate('EcoQuest', { 
      screen: 'QuestDetails', 
      params: { questId: quest.challenge_id || quest.id } 
    });
  };

  return (
    <SafeAreaView 
      edges={['left', 'right']} 
      className="flex-1"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      <HomeHeader />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#374A36"
            colors={['#374A36']}
          />
        }
      >
        {/* Stats Card - Prominent at top */}
        <HomeStats />

        {/* Daily Quests Section */}
        <HomeQuest 
          quests={challenges} 
          loading={isLoading}
          onSeeAll={handleSeeAllQuests}
          onQuestPress={handleQuestPress}
        />

        {/* Recent Activity Section */}
        <HomeActivity />

        {/* Bottom Spacer */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};