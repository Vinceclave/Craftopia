// apps/mobile/src/screens/Home.tsx - POLISHED VERSION
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
    <SafeAreaView edges={['left', 'right']} className="flex-1" style={{ backgroundColor: '#F8FAF7' }}>
      {/* Header */}
      <HomeHeader />

      {/* Connection Banner */}
      {!isConnected && (
        <View className="mx-5 mt-2 p-3 rounded-xl bg-white shadow-sm border border-craftopa-light/5 flex-row items-center">
          <View className="w-6 h-6 rounded-lg bg-red-50 items-center justify-center mr-2 border border-red-100">
            <WifiOff size={14} color="#EF4444" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-poppinsBold text-craftopa-textPrimary mb-0.5 tracking-tight">
              Connection Lost
            </Text>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
              Reconnecting to real-time updates...
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#5A7160" colors={['#5A7160']} />}
      >
        {/* Stats Section */}
        <HomeStats />

        {/* Daily Quests Section */}
        <HomeQuest quests={challenges} loading={isLoading} onSeeAll={handleSeeAllQuests} onQuestPress={handleQuestPress} refetch={async () => { await refetch(); }}  />

        {/* Recent Activity Section */}
        <HomeActivity />

        {/* Bottom Spacer */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
};
