import { Badge } from 'lucide-react-native';
import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';

interface QuestBannerProps {
  data?: {
    points: number;
    challenges_completed: number;
    level?: number;
    nextLevelPoints?: number;
  } | null;
  loading: boolean;
}

export const QuestBanner: React.FC<QuestBannerProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <View className="mx-4 mt-4 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light items-center justify-center">
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  }

  if (!data) {
    return null;
  }

  const level = data.level ?? 1;
  const points = data.points ?? 0;
  const nextLevelPoints = data.nextLevelPoints ?? 1000;
  const completedQuests = data.challenges_completed ?? 0;

  const progress = Math.min(points / nextLevelPoints, 1);

  return (
    <View className="mx-4 mt-4 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-sm font-medium text-craftopia-textPrimary">
            Level {level} • Eco Explorer
          </Text>
          <Text className="text-xs text-craftopia-textSecondary mt-1">
            {points}/{nextLevelPoints} to next level
          </Text>

          {/* Progress Bar */}
          <View className="h-1 bg-craftopia-light rounded-full mt-2">
            <View
              className="h-1 rounded-full bg-craftopia-primary"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
        </View>

        <View className="pl-2">
          <View className="p-1 bg-craftopia-primary/10 rounded-full">
            <Badge size={14} className="text-craftopia-primary" />
          </View>
        </View>
      </View>

      {/* Stats (only Completed Quests + Points) */}
      <View className="flex-row justify-between mt-3 pt-2 border-t border-craftopia-light">
        <View className="items-center flex-1">
          <Text className="text-sm font-bold text-craftopia-textPrimary">{completedQuests}</Text>
          <Text className="text-xs text-craftopia-textSecondary">Completed Quests</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-sm font-bold text-craftopia-accent">{points}</Text>
          <Text className="text-xs text-craftopia-textSecondary">Points</Text>
        </View>
      </View>
    </View>
  );
};
