// QuestList.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

interface Challenge {
  challenge_id: number;
  title: string;
  description: string;
  points_reward: number;
  category: string;
  material_type: string;
  source: string;
  is_active: boolean;
  _count: { participants: number };
}

interface QuestListProps {
  challenges: Challenge[] | null;
  loading?: boolean;
}

export const QuestList: React.FC<QuestListProps> = ({ challenges, loading = false }) => {
  if (loading) {
    return (
      <View className="px-4 py-4 flex-row justify-center items-center">
        <ActivityIndicator size="small" color="#4F46E5" />
        <Text className="ml-2 text-sm text-craftopia-textSecondary">Loading quests...</Text>
      </View>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <View className="px-4 py-4">
        <Text className="text-craftopia-textSecondary text-sm text-center">No quests available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={challenges}
      keyExtractor={(item) => item.challenge_id.toString()}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item }) => (
        <View className={`p-3 mb-2 rounded-lg ${item.is_active ? 'bg-craftopia-surface' : 'bg-craftopia-light'}`}>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-craftopia-textPrimary">{item.title}</Text>
            {!item.is_active && (
              <Text className="text-xs text-red-500 font-medium">Inactive</Text>
            )}
          </View>

          <Text className="text-sm text-craftopia-textSecondary mt-1">{item.description}</Text>

          <View className="flex-row justify-between mt-2">
            <Text className="text-sm font-medium text-craftopia-primary">
              {item.points_reward} pts
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              {item._count.participants} participants
            </Text>
          </View>

          <View className="mt-2 flex-row flex-wrap gap-1">
            <Text className="px-2 py-1 bg-craftopia-light rounded-full text-xs text-craftopia-textSecondary">
              {item.category}
            </Text>
            <Text className="px-2 py-1 bg-craftopia-light rounded-full text-xs text-craftopia-textSecondary">
              {item.material_type}
            </Text>
          </View>
        </View>
      )}
    />
  );
};
