// apps/mobile/src/screens/Home.tsx - REAL-TIME VERSION
import React, { useEffect, useCallback } from 'react';
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

const SafeAreaView = Platform.OS === 'web' ? View : RNSafeAreaView;

export const HomeScreen = () => {
  const { data: challenges = [], isLoading, refetch } = useChallenges('daily');
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation();
  const { isConnected, on, off } = useWebSocket();

  // Handle pull-to-refresh
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

  // Setup real-time listeners for home screen
  useEffect(() => {
    if (!isConnected) {
      console.log('🏠 HomeScreen: WebSocket not connected, skipping listeners');
      return;
    }

    console.log('🏠 HomeScreen: Setting up real-time listeners');

    // Challenge events that affect home screen
    const handleChallengeCreated = (data: any) => {
      console.log('🆕 HomeScreen: New challenge created, refreshing list');
      refetch();
    };

    const handleChallengeUpdated = (data: any) => {
      console.log('📝 HomeScreen: Challenge updated, refreshing list');
      refetch();
    };

    const handleChallengeJoined = (data: any) => {
      console.log('✅ HomeScreen: Challenge joined, refreshing list');
      refetch();
    };

    const handleChallengeVerified = (data: any) => {
      console.log('🎉 HomeScreen: Challenge verified, refreshing all data');
      refetch();
    };

    const handlePointsAwarded = (data: any) => {
      console.log('⭐ HomeScreen: Points awarded, stats will update');
      // Stats component handles this with its own listener
    };

    // System events
    const handleSystemUpdate = (data: any) => {
      console.log('🚀 HomeScreen: System update received:', data.message);
      // Could show a toast notification here
    };

    const handleAnnouncement = (data: any) => {
      console.log('📢 HomeScreen: Announcement received:', data);
      // Could show announcement banner
    };

    // Register listeners
    on(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
    on(WebSocketEvent.CHALLENGE_UPDATED, handleChallengeUpdated);
    on(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    on(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
    on(WebSocketEvent.SYSTEM_UPDATE, handleSystemUpdate);
    on(WebSocketEvent.ANNOUNCEMENT_CREATED, handleAnnouncement);

    console.log('✅ HomeScreen: Real-time listeners registered');

    // Cleanup
    return () => {
      console.log('🧹 HomeScreen: Removing real-time listeners');
      off(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
      off(WebSocketEvent.CHALLENGE_UPDATED, handleChallengeUpdated);
      off(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
      off(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
      off(WebSocketEvent.SYSTEM_UPDATE, handleSystemUpdate);
      off(WebSocketEvent.ANNOUNCEMENT_CREATED, handleAnnouncement);
    };
  }, [isConnected, on, off, refetch]);

  const handleSeeAllQuests = useCallback(() => {
    navigation.navigate('EcoQuest');
  }, [navigation]);

  const handleQuestPress = useCallback((quest) => {
    console.log('Quest pressed:', quest);
    navigation.navigate('EcoQuest', { 
      screen: 'QuestDetails', 
      params: { questId: quest.challenge_id || quest.id } 
    });
  }, [navigation]);

  return (
    <SafeAreaView 
      edges={['left', 'right']} 
      className="flex-1"
      style={{ backgroundColor: '#F9FAFB' }}
    >
      <HomeHeader />
      
      {/* Connection Status Banner (only shown when disconnected) */}
      {!isConnected && (
        <View 
          className="mx-4 mt-2 p-3 rounded-xl flex-row items-center"
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
          <Text className="text-xs font-semibold flex-1" style={{ color: '#DC2626' }}>
            Connecting to real-time updates...
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#374A36"
            colors={['#374A36']}
          />
        }
      >
        {/* Stats Card - Real-time updates */}
        <HomeStats />

        {/* Daily Quests Section - Real-time updates */}
        <HomeQuest 
          quests={challenges} 
          loading={isLoading}
          onSeeAll={handleSeeAllQuests}
          onQuestPress={handleQuestPress}
          refetch={refetch}
        />

        {/* Recent Activity Section */}
        <HomeActivity />

        {/* Bottom Spacer */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  );
};