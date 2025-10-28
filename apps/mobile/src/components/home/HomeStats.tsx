// apps/mobile/src/components/home/HomeStats.tsx - REAL-TIME VERSION
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Leaf, TrendingUp, Award, ChevronRight, Sparkles, Palette, Trophy } from 'lucide-react-native';
import { useUserStats } from '~/hooks/useUserStats';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';
import { useUserWasteStats } from '~/hooks/queries/useUserChallenges';

export const HomeStats = () => {
  const { data: userStats, refetch } = useUserStats();

  console.log(userStats)
  const { on, off, isConnected } = useWebSocket();
  const [animatePoints, setAnimatePoints] = useState(false);
  const [animateWaste, setAnimateWaste] = useState(false);

  const stats = {
    wasteSaved: ((userStats?.points || 0) * 0.1).toFixed(1),
    points: userStats?.points || 0,
    crafts: userStats?.crafts_created || 0,
    challenges: userStats?.challenges_completed || 0,
  };

  const {
      data: wasteStats,
      isLoading: wasteLoading,
      error: wasteError
    } = useUserWasteStats();
  

    console.log(wasteStats)

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    console.log('📊 HomeStats: Setting up real-time listeners');

    // Listen for points updates
    const handlePointsAwarded = (data: any) => {
      console.log('⭐ HomeStats: Points awarded event received:', data);
      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 1000);
      refetch(); // Refresh stats
    };

    const handlePointsUpdated = (data: any) => {
      console.log('📈 HomeStats: Points updated event received:', data);
      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 1000);
      refetch();
    };

    // Listen for challenge completion (affects waste saved)
    const handleChallengeVerified = (data: any) => {
      console.log('🎉 HomeStats: Challenge verified event received:', data);
      setAnimateWaste(true);
      setAnimatePoints(true);
      setTimeout(() => {
        setAnimateWaste(false);
        setAnimatePoints(false);
      }, 1000);
      refetch();
    };

    // Register listeners
    on(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
    on(WebSocketEvent.POINTS_UPDATED, handlePointsUpdated);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);

    console.log('✅ HomeStats: Real-time listeners registered');

    // Cleanup
    return () => {
      console.log('🧹 HomeStats: Removing real-time listeners');
      off(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
      off(WebSocketEvent.POINTS_UPDATED, handlePointsUpdated);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    };
  }, [isConnected, on, off, refetch]);

  return (
    <View className="px-4 pt-4">
      {/* Main Impact Card */}
      <View 
        className="bg-white rounded-2xl p-4 mb-3"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#6B7280' }}>
              Your Impact
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              Keep making a difference! 🌍
            </Text>
          </View>
          <TouchableOpacity 
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F3F4F6' }}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-semibold mr-1" style={{ color: '#374A36' }}>
              Details
            </Text>
            <ChevronRight size={12} color="#374A36" />
          </TouchableOpacity>
        </View>

        {/* Primary Stat - Waste Saved */}
        <View 
          className="rounded-xl p-4 mb-3"
          style={{ 
            backgroundColor: animateWaste ? 'rgba(55, 74, 54, 0.15)' : 'rgba(55, 74, 54, 0.08)',
            borderWidth: 1,
            borderColor: animateWaste ? 'rgba(55, 74, 54, 0.3)' : 'rgba(55, 74, 54, 0.15)',
            transform: animateWaste ? [{ scale: 1.02 }] : [{ scale: 1 }],
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: 'rgba(55, 74, 54, 0.15)' }}
                >
                  <Leaf size={16} color="#374A36" />
                </View>
                <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                  Waste Saved
                </Text>
              </View>
              <Text className="text-3xl font-bold mb-1" style={{ color: '#374A36' }}>
                {wasteStats.total_waste_kg}
                <Text className="text-lg" style={{ color: '#6B7280' }}> kg</Text>
              </Text>
              <View className="flex-row items-center">
                <Sparkles size={12} color="#374A36" />
                <Text className="text-xs font-semibold ml-1" style={{ color: '#374A36' }}>
                  {animateWaste ? 'Just updated! 🎉' : 'Amazing progress!'}
                </Text>
              </View>
            </View>
            
            {/* Decorative Element */}
            <View 
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
            >
              <Leaf size={40} color="#374A36" />
            </View>
          </View>
        </View>

        {/* Secondary Stats Grid */}
        <View className="flex-row gap-2">
          {/* Points */}
          <View 
            className="flex-1 rounded-xl p-3"
            style={{ 
              backgroundColor: animatePoints ? 'rgba(212, 169, 106, 0.15)' : '#F9FAFB',
              transform: animatePoints ? [{ scale: 1.05 }] : [{ scale: 1 }],
            }}
          >
            <View className="flex-row items-center mb-2">
              <View 
                className="w-7 h-7 rounded-full items-center justify-center mr-1.5"
                style={{ backgroundColor: 'rgba(212, 169, 106, 0.2)' }}
              >
                <Award size={12} color="#D4A96A" />
              </View>
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Points
              </Text>
            </View>
            <Text className="text-xl font-bold mb-0.5" style={{ color: '#374A36' }}>
              {stats.points}
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              +{Math.floor(stats.points * 0.1)} today
            </Text>
          </View>

          {/* Crafts */}
          <View 
            className="flex-1 rounded-xl p-3"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row items-center mb-2">
              <View 
                className="w-7 h-7 rounded-full items-center justify-center mr-1.5"
                style={{ backgroundColor: 'rgba(147, 51, 234, 0.15)' }}
              >
                <Palette size={12} color="#9333EA" />
              </View>
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Crafts
              </Text>
            </View>
            <Text className="text-xl font-bold mb-0.5" style={{ color: '#374A36' }}>
              {stats.crafts}
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              Created
            </Text>
          </View>

          {/* Challenges */}
          <View 
            className="flex-1 rounded-xl p-3"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row items-center mb-2">
              <View 
                className="w-7 h-7 rounded-full items-center justify-center mr-1.5"
                style={{ backgroundColor: 'rgba(55, 74, 54, 0.15)' }}
              >
                <Trophy size={12} color="#374A36" />
              </View>
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Quests
              </Text>
            </View>
            <Text className="text-xl font-bold mb-0.5" style={{ color: '#374A36' }}>
              {stats.challenges}
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              Done
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};