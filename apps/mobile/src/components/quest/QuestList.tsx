import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Leaf, Users, Award, Calendar } from 'lucide-react-native';

interface Challenge {
  challenge_id: number;
  title: string;
  description: string;
  points_reward: number;
  waste_kg: number;
  participantCount: number;
  category: string;
  material_type: string;
  is_active: boolean;
  isJoined: boolean;
  duration?: string;
}

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
  const renderChallengeItem = ({ item }: { item: Challenge }) => {
    const challengeId = item.challenge_id;

    return (
      <TouchableOpacity
        onPress={() => onJoin(challengeId)}
        disabled={!item.is_active || item.isJoined}
        activeOpacity={0.7}
        className={`mx-4 mb-3 p-4 rounded-2xl border ${
          item.is_active 
            ? 'bg-craftopia-surface border-craftopia-light' 
            : 'bg-craftopia-light/50 border-craftopia-light'
        } ${(item.is_active && !item.isJoined) ? 'active:scale-95' : ''}`}
      >
        {/* Header with title and status */}
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-base font-bold text-craftopia-textPrimary flex-1 mr-2" numberOfLines={2}>
            {item.title}
          </Text>
          {!item.is_active && (
            <View className="px-2 py-1 bg-gray-100 rounded-full">
              <Text className="text-xs font-medium text-gray-500">Inactive</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text className="text-sm text-craftopia-textSecondary leading-5 mb-3" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Stats Row */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            {/* Points */}
            <View className="flex-row items-center bg-craftopia-primary/5 px-2.5 py-1.5 rounded-full">
              <Award size={14} color="#374A36" />
              <Text className="text-craftopia-primary text-sm font-bold ml-1">
                {item.points_reward}
              </Text>
            </View>

            {/* Waste Saved */}
            {item.waste_kg > 0 && (
              <View className="flex-row items-center bg-craftopia-success/10 px-2.5 py-1.5 rounded-full">
                <Leaf size={14} color="#4A7C59" />
                <Text className="text-craftopia-success text-sm font-bold ml-1">
                  {item.waste_kg.toFixed(1)}kg
                </Text>
              </View>
            )}

            {/* Participants */}
            <View className="flex-row items-center bg-craftopia-light px-2.5 py-1.5 rounded-full">
              <Users size={14} color="#5D6B5D" />
              <Text className="text-craftopia-textSecondary text-sm font-medium ml-1">
                {item.participantCount || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Tags */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          <View className="px-2.5 py-1 bg-craftopia-light rounded-full">
            <Text className="text-xs text-craftopia-textSecondary font-medium">{item.category}</Text>
          </View>
          <View className="px-2.5 py-1 bg-craftopia-light rounded-full">
            <Text className="text-xs text-craftopia-textSecondary font-medium">{item.material_type}</Text>
          </View>
        </View>

        {/* Join Button */}
        {item.is_active && (
          <View className={`px-3 py-2.5 rounded-xl ${
            item.isJoined ? 'bg-craftopia-light' : 'bg-craftopia-primary'
          }`}>
            <Text className={`text-center font-semibold text-sm ${
              item.isJoined ? 'text-craftopia-textSecondary' : 'text-craftopia-surface'
            }`}>
              {item.isJoined ? '✓ Already Joined' : 'Join Challenge'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <ActivityIndicator size="small" color="#374A36" />
        <Text className="text-craftopia-textSecondary text-sm mt-3">
          Loading quests...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6 py-8">
        <Text className="text-lg font-bold text-craftopia-textPrimary text-center mb-2">
          Something went wrong
        </Text>
        <Text className="text-sm text-craftopia-textSecondary text-center mb-6">
          {error}
        </Text>
        <TouchableOpacity 
          onPress={onRetry} 
          className="bg-craftopia-primary px-5 py-3 rounded-xl"
          activeOpacity={0.7}
        >
          <Text className="text-craftopia-surface text-sm font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state
  if (!loading && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6 py-8">
        <Text className="text-lg font-bold text-craftopia-textPrimary text-center mb-2">
          No quests found
        </Text>
        <Text className="text-sm text-craftopia-textSecondary text-center mb-6">
          Check back later for new eco-challenges
        </Text>
        <TouchableOpacity 
          onPress={onRefresh} 
          className="bg-craftopia-primary px-5 py-3 rounded-xl"
          activeOpacity={0.7}
        >
          <Text className="text-craftopia-surface text-sm font-semibold">Refresh</Text>
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
          colors={['#374A36']}
          tintColor="#374A36"
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingVertical: 8,
        paddingBottom: 60
      }}
    />
  );
};