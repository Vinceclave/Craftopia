// apps/mobile/src/components/home/HomeStats.tsx
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useAuth } from '~/context/AuthContext';
import { useUserStats } from '~/hooks/useUserStats';
import { HomeStatsSkeleton } from './HomeStatsSkeleton';

export const HomeStats = () => {
  const { user } = useAuth();
  const { 
    data: userStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useUserStats();

  // Loading state
  if (statsLoading) {
    return (
      <HomeStatsSkeleton />
    );
  }

  // Error state
  if (statsError) {
    return (
      <View style={{ marginTop: -40 }} className="mx-4 bg-craftopia-primary rounded-2xl p-4 border border-craftopia-light">
        <View className="flex-row items-center">
          <View className="mr-3 bg-craftopia-secondary/20 p-2 rounded-full">
            <TrendingUp size={20} color='#ffff' />
          </View>
          <View>
            <Text className="text-lg font-extrabold text-craftopia-surface">
              0.0kg
            </Text>
            <Text className="text-xs text-craftopia-surface/80 mt-0.5">
              waste saved
            </Text>
          </View>
        </View>
      </View>
    );
  }

  console.log(userStats?.points)

  // Use stats from the API or fallback to user profile
  const totalPoints = user?.profile?.points || 0;
  const craftsCount = userStats?.crafts_created || 0;

  // Calculate waste saved (example: 0.1kg per point earned)
  const wasteSaved = (totalPoints * 0.1).toFixed(1);

  return (
    <View style={{ marginTop: -40 }} className="mx-4 bg-craftopia-primary rounded-2xl p-4 border border-craftopia-light">
      <View className="flex-row items-center">
        {/* Left: Waste Saved */}
        <View className="flex-row items-center flex-1">
          <View className="mr-3 bg-craftopia-secondary/20 p-2 rounded-full">
            <TrendingUp size={20} color='#ffff' />
          </View>
          <View>
            <Text className="text-lg font-extrabold text-craftopia-surface">
              {wasteSaved}kg
            </Text>
            <Text className="text-xs text-craftopia-surface/80 mt-0.5">
              waste saved
            </Text>
          </View>
        </View>

        {/* Right: Stats Grid */}
        <View className="flex-row items-center gap-3">
          {/* Points */}
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Text className="text-sm font-bold text-craftopia-surface">
              {totalPoints.toLocaleString()}
            </Text>
            <Text className="text-xs text-craftopia-surface/80 uppercase tracking-wide">
              POINTS
            </Text>
          </View>
          
          {/* Crafts */}
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Text className="text-sm font-bold text-craftopia-surface">
              {craftsCount}
            </Text>
            <Text className="text-xs text-craftopia-surface/80 uppercase tracking-wide">
              CRAFTS
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};