// HomeStats.jsx - Redesigned
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
    <View className="mx-5 mt-4 mb-6">
      <View className="bg-craftopia-surface rounded-3xl px-6 py-5 shadow-sm border border-craftopia-light/50">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-xs font-medium text-craftopia-textSecondary uppercase tracking-wider mb-1">
              Waste Saved
            </Text>
            <Text className="text-3xl font-bold text-craftopia-primary mb-2">
              {stats.wasteSaved}kg
            </Text>
            <View className="w-12 h-1 bg-craftopia-accent rounded-full" />
          </View>
          
          <View className="flex-row gap-2">
            <View className="items-center">
              <View className="w-10 h-10 rounded-full bg-craftopia-primary/10 items-center justify-center mb-2">
                <Text className="text-lg font-bold text-craftopia-primary">
                  {stats.points}
                </Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary">Points</Text>
            </View>
            
            <View className="items-center">
              <View className="w-10 h-10 rounded-full bg-craftopia-accent/10 items-center justify-center mb-2">
                <Text className="text-lg font-bold text-craftopia-accent">
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