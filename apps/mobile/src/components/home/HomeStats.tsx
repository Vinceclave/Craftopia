import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useCurrentUser } from '~/hooks/useAuth';

export const HomeStats = () => {
  const { data: user, isLoading, error } = useCurrentUser();

  // Loading state
  if (isLoading) {
    return (
      <View style={{ marginTop: -40 }} className="mx-4 bg-craftopia-primary rounded-2xl p-4 border border-craftopia-light">
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#ffffff" />
          <Text className="text-craftopia-surface ml-2">Loading stats...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
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

  // Safe access to user data with fallbacks
  const userPoints = user?.profile?.points || 0;
  const userLevel = Math.floor(userPoints / 100) + 1;
  const craftsCount = user?.profile?.crafts_count || 0;

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
              {(userPoints * 0.1).toFixed(1)}kg
            </Text>
            <Text className="text-xs text-craftopia-surface/80 mt-0.5">
              waste saved
            </Text>
          </View>
        </View>

        {/* Right: Points and Crafts */}
        <View className="flex-row items-center gap-4">
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Text className="text-base font-bold text-craftopia-surface">
              {userPoints.toLocaleString()}
            </Text>
            <Text className="text-xs text-craftopia-surface/80 uppercase tracking-wide">
              POINTS
            </Text>
          </View>
          
          <View className="items-center bg-craftopia-secondary/20 p-2 rounded-lg">
            <Text className="text-base font-bold text-craftopia-surface">
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