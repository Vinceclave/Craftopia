import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import Button from '~/components/common/Button';
import { Challenge } from '~/hooks/queries/useChallenges';
import { Leaf } from 'lucide-react-native';

interface QuestListProps {
  challenges: Challenge[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onJoin: (challengeId: number) => void;
  onRetry: () => void;
}

export const QuestList: React.FC<QuestListProps> = ({
  challenges,
  loading,
  refreshing,
  error,
  onRefresh,
  onJoin,
  onRetry,
}) => {
  const renderChallengeItem = ({ item }: { item: Challenge }) => (
    <View className={`p-4 mb-3 mx-4 rounded-lg border ${
      item.is_active ? 'bg-craftopia-surface border-craftopia-light' : 'bg-craftopia-light/50 border-craftopia-light'
    }`}>
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-medium text-craftopia-textPrimary">{item.title}</Text>
        {!item.is_active && <Text className="text-xs text-red-500 font-medium">Inactive</Text>}
      </View>

      <Text className="text-sm text-craftopia-textSecondary mt-2">{item.description}</Text>

      {/* NEW: Waste and Points Row */}
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center space-x-3">
          <Text className="text-sm font-medium text-craftopia-primary">{item.points_reward} pts</Text>
          {/* NEW: Waste indicator */}
          {item.waste_kg > 0 && (
            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
              <Leaf size={12} className="text-green-600 mr-1" />
              <Text className="text-xs font-medium text-green-600">
                {item.waste_kg.toFixed(2)} kg
              </Text>
            </View>
          )}
        </View>
        <Text className="text-xs text-craftopia-textSecondary">
          {item.participantCount || 0} participants
        </Text>
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="px-3 py-1.5 bg-craftopia-light rounded-full">
          <Text className="text-xs text-craftopia-textSecondary">{item.category}</Text>
        </View>
        <View className="px-3 py-1.5 bg-craftopia-light rounded-full">
          <Text className="text-xs text-craftopia-textSecondary">{item.material_type}</Text>
        </View>
      </View>

      {item.is_active && (
        <View className="mt-4">
          <Button
            title={item.isJoined ? "Already Joined" : "Join Challenge"}
            onPress={() => onJoin(item.challenge_id)}
            size="md"
            disabled={item.isJoined}
            className={item.isJoined ? "bg-craftopia-light" : ""}
            textClassName={item.isJoined ? "text-craftopia-textSecondary" : ""}
          />
        </View>
      )}
    </View>
  );

  // Loading state
  if (loading && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-6">
        <ActivityIndicator size="small" color="#004E98" />
        <Text className="text-craftopia-textSecondary text-sm mt-2">
          Loading quests...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-6 px-4">
        <Text className="text-craftopia-textPrimary text-base font-medium text-center mb-1">
          Something went wrong
        </Text>
        <Text className="text-craftopia-textSecondary text-sm text-center mb-4">
          {error}
        </Text>
        <TouchableOpacity onPress={onRetry} className="bg-craftopia-primary px-4 py-2 rounded-lg">
          <Text className="text-craftopia-surface text-sm font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (!loading && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-6 px-4">
        <Text className="text-craftopia-textPrimary text-base font-medium mb-1">
          No quests found
        </Text>
        <Text className="text-craftopia-textSecondary text-sm text-center mb-4">
          Check back later for new eco-challenges
        </Text>
        <TouchableOpacity onPress={onRefresh} className="bg-craftopia-primary px-4 py-2 rounded-lg">
          <Text className="text-craftopia-surface text-sm font-medium">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={challenges}
      keyExtractor={(item) => item.challenge_id.toString()}
      renderItem={renderChallengeItem}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#004E98']}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingBottom: 80,
        paddingTop: 8
      }}
    />
  );
};