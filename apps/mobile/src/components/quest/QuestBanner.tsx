import { Award, CheckCircle, Leaf } from 'lucide-react-native';
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

interface QuestBannerProps {
  data?: {
    points: number;
    challenges_completed: number;
    total_waste_kg?: number;
  } | null;
  loading: boolean;
}

export const QuestBanner: React.FC<QuestBannerProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <View className="mx-4 mt-4 p-5 bg-craftopia-surface rounded-2xl border border-craftopia-light">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <View className="h-5 bg-craftopia-light rounded-full mb-2 w-32" />
          </View>
          <View className="w-8 h-8 bg-craftopia-light rounded-full" />
        </View>
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <View className="h-4 bg-craftopia-light rounded mb-1 w-8" />
            <View className="h-3 bg-craftopia-light rounded w-12" />
          </View>
          <View className="items-center flex-1">
            <View className="h-4 bg-craftopia-light rounded mb-1 w-8" />
            <View className="h-3 bg-craftopia-light rounded w-12" />
          </View>
          <View className="items-center flex-1">
            <View className="h-4 bg-craftopia-light rounded mb-1 w-8" />
            <View className="h-3 bg-craftopia-light rounded w-12" />
          </View>
        </View>
      </View>
    );
  }

  if (!data) {
    return null;
  }

  const points = data.points ?? 0;
  const completedQuests = data.challenges_completed ?? 0;
  const totalWaste = data.total_waste_kg ?? 0;

  return (
    <View className="mx-4 mt-4 p-5 bg-craftopia-surface rounded-2xl border border-craftopia-light">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-craftopia-textPrimary">
            Your Eco Progress
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-1">
            Track your sustainability journey
          </Text>
        </View>

        <View className="w-10 h-10 items-center justify-center bg-craftopia-primary/10 rounded-full ml-3">
          <Leaf size={20} color="#374A36" />
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row justify-between">
        {/* Completed Quests */}
        <View className="items-center flex-1">
          <View className="flex-row items-center mb-1">
            <CheckCircle size={16} color="#4A7C59" />
            <Text className="text-base font-bold text-craftopia-success ml-1.5">
              {completedQuests}
            </Text>
          </View>
          <Text className="text-xs text-craftopia-textSecondary font-medium">
            Completed
          </Text>
        </View>

        {/* Points */}
        <View className="items-center flex-1">
          <View className="flex-row items-center mb-1">
            <Award size={16} color="#D4A96A" />
            <Text className="text-base font-bold text-craftopia-accent ml-1.5">
              {points}
            </Text>
          </View>
          <Text className="text-xs text-craftopia-textSecondary font-medium">
            Points
          </Text>
        </View>

        {/* Waste Saved */}
        <View className="items-center flex-1">
          <View className="flex-row items-center mb-1">
            <Leaf size={16} color="#4A7C59" />
            <Text className="text-base font-bold text-craftopia-success ml-1.5">
              {totalWaste.toFixed(1)}
            </Text>
          </View>
          <Text className="text-xs text-craftopia-textSecondary font-medium">
            kg saved
          </Text>
        </View>
      </View>
    </View>
  );
};