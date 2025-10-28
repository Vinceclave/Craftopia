// HomeStats.tsx - REDESIGNED with cleaner card design
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Leaf, TrendingUp, Award, ChevronRight } from 'lucide-react-native';
import { useUserStats } from '~/hooks/useUserStats';

export const HomeStats = () => {
  const { data: userStats } = useUserStats();

  const stats = {
    wasteSaved: ((userStats?.points || 0) * 0.1).toFixed(1),
    points: userStats?.points || 0,
    crafts: userStats?.crafts_created || 0,
    challenges: userStats?.challenges_completed || 0,
  };

  return (
    <View className="px-4 pt-4">
      {/* Main Impact Card */}
      <View className="bg-craftopia-surface rounded-2xl p-5 border border-craftopia-light/50 mb-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs font-medium text-craftopia-textSecondary uppercase tracking-wider mb-1">
              Your Impact
            </Text>
            <Text className="text-sm text-craftopia-textSecondary">
              Keep making a difference! 🌍
            </Text>
          </View>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-xs font-semibold text-craftopia-primary mr-1">
              Details
            </Text>
            <ChevronRight size={14} color="#374A36" />
          </TouchableOpacity>
        </View>

        {/* Primary Stat - Waste Saved */}
        <View className="bg-gradient-to-r from-craftopia-primary/10 to-craftopia-success/10 rounded-xl p-4 mb-4 border border-craftopia-primary/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-craftopia-success/20 rounded-full items-center justify-center mr-2">
                  <Leaf size={16} color="#4A7C59" />
                </View>
                <Text className="text-sm font-medium text-craftopia-textSecondary">
                  Waste Saved
                </Text>
              </View>
              <Text className="text-3xl font-bold text-craftopia-primary mb-1">
                {stats.wasteSaved}
                <Text className="text-lg text-craftopia-textSecondary"> kg</Text>
              </Text>
              <Text className="text-xs text-craftopia-success">
                🎉 Amazing progress!
              </Text>
            </View>
            
            {/* Decorative Element */}
            <View className="w-20 h-20 bg-craftopia-success/10 rounded-full items-center justify-center">
              <Text className="text-4xl">♻️</Text>
            </View>
          </View>
        </View>

        {/* Secondary Stats Grid */}
        <View className="flex-row gap-2">
          {/* Points */}
          <View className="flex-1 bg-craftopia-light rounded-xl p-3">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 bg-craftopia-accent/20 rounded-full items-center justify-center mr-1.5">
                <Award size={12} color="#D4A96A" />
              </View>
              <Text className="text-xs text-craftopia-textSecondary font-medium">
                Points
              </Text>
            </View>
            <Text className="text-xl font-bold text-craftopia-primary">
              {stats.points}
            </Text>
            <Text className="text-xs text-craftopia-textSecondary mt-0.5">
              +{Math.floor(stats.points * 0.1)} today
            </Text>
          </View>

          {/* Crafts */}
          <View className="flex-1 bg-craftopia-light rounded-xl p-3">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 bg-craftopia-primary/20 rounded-full items-center justify-center mr-1.5">
                <Text className="text-xs">🎨</Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary font-medium">
                Crafts
              </Text>
            </View>
            <Text className="text-xl font-bold text-craftopia-primary">
              {stats.crafts}
            </Text>
            <Text className="text-xs text-craftopia-textSecondary mt-0.5">
              Created
            </Text>
          </View>

          {/* Challenges */}
          <View className="flex-1 bg-craftopia-light rounded-xl p-3">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 bg-craftopia-success/20 rounded-full items-center justify-center mr-1.5">
                <Text className="text-xs">🏆</Text>
              </View>
              <Text className="text-xs text-craftopia-textSecondary font-medium">
                Quests
              </Text>
            </View>
            <Text className="text-xl font-bold text-craftopia-primary">
              {stats.challenges}
            </Text>
            <Text className="text-xs text-craftopia-textSecondary mt-0.5">
              Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Tip Card */}
      <View className="bg-gradient-to-r from-craftopia-accent/10 to-craftopia-primary/5 rounded-xl px-3 py-3 border border-craftopia-accent/20 mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-full bg-craftopia-accent/20 items-center justify-center mr-2">
            <TrendingUp size={16} color="#D4A96A" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-0.5">
              Daily Tip
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              Complete 3 quests today to unlock bonus rewards!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};