// components/quest/QuestList.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import Button from '~/components/common/Button';

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
  challenges: Challenge[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onJoin: (challengeId: number) => void;
}

export const QuestList: React.FC<QuestListProps> = ({
  challenges,
  loading,
  refreshing,
  onRefresh,
  onJoin,
}) => {
  const renderChallengeItem = ({ item }: { item: Challenge }) => (
    <View className={`p-3 mb-2 mx-4 rounded-lg border ${
      item.is_active ? 'bg-craftopia-surface border-craftopia-light' : 'bg-craftopia-light/50 border-craftopia-light'
    }`}>
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-medium text-craftopia-textPrimary">{item.title}</Text>
        {!item.is_active && <Text className="text-xs text-red-500 font-medium">Inactive</Text>}
      </View>

      <Text className="text-sm text-craftopia-textSecondary mt-1">{item.description}</Text>

      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-sm font-medium text-craftopia-primary">{item.points_reward} pts</Text>
        <Text className="text-xs text-craftopia-textSecondary">{item._count.participants} participants</Text>
      </View>

      <View className="mt-2 flex-row flex-wrap gap-1">
        <View className="px-2 py-1 bg-craftopia-light rounded-full">
          <Text className="text-xs text-craftopia-textSecondary">{item.category}</Text>
        </View>
        <View className="px-2 py-1 bg-craftopia-light rounded-full">
          <Text className="text-xs text-craftopia-textSecondary">{item.material_type}</Text>
        </View>
      </View>

      {item.is_active && (
        <View className="mt-3">
          <Button
            title="Join Challenge"
            onPress={() => onJoin(item.challenge_id)}
            size="md"
          />
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      style={{ paddingBottom: 150 }}
      data={challenges}
      keyExtractor={(item) => item.challenge_id.toString()}
      renderItem={renderChallengeItem}
      ListHeaderComponent={
        loading && challenges.length === 0 ? (
          <View className="py-6">
            <ActivityIndicator size="small" className="text-craftopia-primary" />
            <Text className="text-craftopia-textSecondary text-sm text-center mt-2">
              Loading quests...
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading ? (
          <View className="px-4 py-8 items-center">
            <Text className="text-craftopia-textPrimary text-base font-medium mb-1">
              No quests found
            </Text>
            <Text className="text-craftopia-textSecondary text-sm text-center">
              Check back later for new eco-challenges
            </Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#374A36']}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  );
};
