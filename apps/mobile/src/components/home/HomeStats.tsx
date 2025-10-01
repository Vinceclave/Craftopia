// HomeStats.jsx - Optimized for mobile
import React from 'react';
import { Text, View } from 'react-native';
import { useUserStats } from '~/hooks/useUserStats';

export const HomeStats = () => {
  const { data: userStats } = useUserStats();

  const stats = {
    wasteSaved: ((userStats?.points || 0) * 0.1).toFixed(1),
    points: userStats?.points || 0,
    crafts: userStats?.crafts_created || 0
  };

  return (
    <View className="mx-4 mt-3 mb-4">
      <View className="bg-craftopia-surface rounded-xl px-5 py-4 border border-craftopia-light/50">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xs font-medium text-craftopia-textSecondary uppercase tracking-wider mb-1">
              Waste Saved
            </Text>
            <Text className="text-2xl font-bold text-craftopia-primary mb-1.5">
              {stats.wasteSaved}kg
            </Text>
            <View className="w-10 h-1 bg-craftopia-accent rounded-full" />
          </View>
          
          <View className="flex-row gap-1.5">
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-craftopia-primary/10 items-center justify-center mb-1">
                <Text className="text-base font-bold text-craftopia-primary">
                  {stats.points}
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary">Points</Text>
            </View>
            
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-craftopia-accent/10 items-center justify-center mb-1">
                <Text className="text-base font-bold text-craftopia-accent">
                  {stats.crafts}
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary">Crafts</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};