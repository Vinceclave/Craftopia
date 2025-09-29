// HomeScreen.jsx - Updated with enhanced components
import React from 'react';
import { ScrollView, Platform, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '~/components/home/HomeHeader';
import { HomeQuest } from '~/components/home/HomeQuest';
import { HomeStats } from '~/components/home/HomeStats';
import { useChallenges } from '~/hooks/queries/useChallenges';
import { useNavigation } from '@react-navigation/native';

const SafeAreaView = Platform.OS === 'web' ? View : RNSafeAreaView;

export const HomeScreen = () => {
  const { data: challenges = [], isLoading } = useChallenges('daily');
  const navigation = useNavigation();

  const handleSeeAllQuests = () => {
    navigation.navigate('Quests');
  };

  const handleQuestPress = (quest) => {
    // Handle quest press - could navigate to quest details
    console.log('Quest pressed:', quest);
  };

  return (
    <SafeAreaView edges={['left','right']} className="flex-1 bg-craftopia-light">
      <HomeHeader />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <HomeStats />
        <HomeQuest 
          quests={challenges} 
          loading={isLoading}
          onSeeAll={handleSeeAllQuests}
          onQuestPress={handleQuestPress}
        />
      </ScrollView>
    </SafeAreaView>
  );
};