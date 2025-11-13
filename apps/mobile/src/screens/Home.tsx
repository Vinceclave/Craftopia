import React, { useEffect, useCallback, useState } from 'react';
import { ScrollView, Platform, View, RefreshControl, Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '~/components/home/HomeHeader';
import { HomeStats } from '~/components/home/HomeStats';
import { HomeQuest } from '~/components/home/HomeQuest';
import { HomeActivity } from '~/components/home/HomeActivity';
import { useChallenges } from '~/hooks/queries/useChallenges';
import { useNavigation } from '@react-navigation/native';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';
import { WifiOff } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '~/navigations/MainNavigator';

const SafeAreaView = Platform.OS === 'web' ? View : RNSafeAreaView;

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: challenges = [], isLoading, refetch } = useChallenges('daily');
  const [refreshing, setRefreshing] = useState(false);
  const { isConnected, on, off } = useWebSocket();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh home data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // WebSocket listeners
  useEffect(() => {
    if (!isConnected) return;

    const handleRefetch = () => refetch();

    on(WebSocketEvent.CHALLENGE_CREATED, handleRefetch);
    on(WebSocketEvent.CHALLENGE_UPDATED, handleRefetch);
    on(WebSocketEvent.CHALLENGE_JOINED, handleRefetch);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleRefetch);

    // Cleanup
    return () => {
      off(WebSocketEvent.CHALLENGE_CREATED, handleRefetch);
      off(WebSocketEvent.CHALLENGE_UPDATED, handleRefetch);
      off(WebSocketEvent.CHALLENGE_JOINED, handleRefetch);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleRefetch);
    };
  }, [isConnected, on, off, refetch]);

  const handleSeeAllQuests = useCallback(() => {
    navigation.navigate('MainTabs', {
      screen: 'EcoQuestStack',
      params: {
        screen: 'EcoQuest',
      },
    });
  }, [navigation]);

  const handleQuestPress = useCallback(
    (quest: any) => {
      navigation.navigate('MainTabs', {
        screen: 'EcoQuestStack',
        params: {
          screen: 'QuestDetails',
          params: { questId: quest.challenge_id || quest.id },
        },
      });
    },
    [navigation]
  );

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <HomeHeader />

      {/* Connection Banner */}
      {!isConnected && (
        <View className="mx-4 mt-2 p-3 rounded-xl bg-craftopia-surface border border-craftopia-light flex-row items-center">
          <View className="w-6 h-6 rounded-lg bg-craftopia-error/10 items-center justify-center mr-3 border border-craftopia-error/20">
            <WifiOff size={14} color="#D66B4E" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-1">
              Connection Lost
            </Text>
            <Text className="text-xs font-nunito text-craftopia-textSecondary">
              Reconnecting to real-time updates...
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            tintColor="#3B6E4D" 
            colors={['#3B6E4D']} 
          />
        }
      >
        {/* Stats Section */}
        <HomeStats />

        {/* Daily Quests Section */}
        <HomeQuest 
          quests={challenges} 
          loading={isLoading} 
          onSeeAll={handleSeeAllQuests} 
          onQuestPress={handleQuestPress} 
          refetch={async () => { await refetch(); }} 
        />

        {/* Recent Activity Section */}
        <HomeActivity />

        {/* Bottom Spacer */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
};