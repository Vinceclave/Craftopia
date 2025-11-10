// QuestList.tsx - FIXED: All text properly wrapped in Text components
import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Target, ChevronRight, Flame, TrendingUp, Calendar } from 'lucide-react-native';

interface Challenge {
  challenge_id: number;
  title: string;
  description?: string;
  category: string;
  points_reward: number;
  waste_kg?: number;
  participantCount?: number;
}

interface QuestListProps {
  challenges: Challenge[];
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onJoin: (challengeId: number) => void;
  onRetry?: () => void;
}

export const QuestList = ({
  challenges,
  loading,
  refreshing,
  error,
  onRefresh,
  onJoin,
  onRetry
}: QuestListProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'daily':
        return <Flame size={16} color="#D4A96A" />;
      case 'weekly':
        return <TrendingUp size={16} color="#D4A96A" />;
      case 'monthly':
        return <Calendar size={16} color="#D4A96A" />;
      default:
        return <Target size={16} color="#D4A96A" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'daily':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'weekly':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'monthly':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-craftopia-accent/10 border-craftopia-accent/20';
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="mx-4 mb-6">
        {/* Section Header Skeleton */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-light mr-2" />
            <View>
              <View className="w-24 h-4 bg-craftopia-light rounded mb-1" />
              <View className="w-32 h-3 bg-craftopia-light rounded" />
            </View>
          </View>
        </View>

        {/* Quest Item Skeletons */}
        {[1, 2, 3].map((item) => (
          <View 
            key={item} 
            className="bg-craftopia-surface rounded-xl p-3 mb-2 border border-craftopia-light/50"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-16 h-5 bg-craftopia-light rounded" />
              <View className="w-12 h-5 bg-craftopia-light rounded" />
            </View>
            <View className="w-3/4 h-4 bg-craftopia-light rounded mb-2" />
            <View className="w-full h-3 bg-craftopia-light rounded mb-2" />
            <View className="flex-row justify-between items-center">
              <View className="w-20 h-3 bg-craftopia-light rounded" />
              <View className="w-20 h-8 bg-craftopia-light rounded-lg" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="mx-4 mb-6">
        <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light/50">
          <View className="w-12 h-12 rounded-full bg-red-500/10 items-center justify-center mb-3">
            <Target size={20} color="#DC2626" />
          </View>
          <Text className="text-base font-semibold text-craftopia-textPrimary mb-1">
            Failed to Load Quests
          </Text>
          <Text className="text-xs text-craftopia-textSecondary text-center mb-3">
            {error}
          </Text>
          {onRetry && (
            <TouchableOpacity 
              className="bg-craftopia-primary rounded-full px-4 py-2"
              onPress={onRetry}
            >
              <Text className="text-xs font-semibold text-white">
                Try Again
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (!challenges || challenges.length === 0) {
    return (
      <View className="mx-4 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
              <Target size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Available Quests
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                Join challenges and earn rewards
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light/50">
          <View className="w-12 h-12 rounded-full bg-craftopia-light/50 items-center justify-center mb-3">
            <Target size={20} color="#5D6B5D" />
          </View>
          <Text className="text-base font-semibold text-craftopia-textPrimary mb-1">
            No Quests Available
          </Text>
          <Text className="text-xs text-craftopia-textSecondary text-center mb-3">
            New challenges will appear soon. Check back later!
          </Text>
        </View>
      </View>
    );
  }

  const QuestItem = ({ quest }: { quest: Challenge }) => (
    <TouchableOpacity
      className="bg-craftopia-surface rounded-xl p-3 mb-2 border border-craftopia-light/50"
      onPress={() => onJoin(quest.challenge_id)}
      activeOpacity={0.7}
    >
      {/* Category Badge */}
      <View className="flex-row items-center justify-between mb-2">
        <View className={`flex-row items-center px-2 py-1 rounded-lg border ${getCategoryColor(quest.category)}`}>
          {getCategoryIcon(quest.category)}
          <Text className="text-xs font-medium text-craftopia-accent uppercase tracking-wide ml-1">
            {quest.category}
          </Text>
        </View>
        
        <View className="px-2 py-1 rounded-lg bg-craftopia-primary/10">
          <Text className="text-xs font-bold text-craftopia-primary">
            +{quest.points_reward}
          </Text>
        </View>
      </View>

      {/* Quest Info */}
      <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1">
        {quest.title}
      </Text>
      <Text className="text-xs text-craftopia-textSecondary mb-2" numberOfLines={2}>
        {quest.description || 'Complete this challenge to earn points'}
      </Text>

      {/* Footer with stats and action - FIXED */}
      <View className="flex-row justify-between items-center pt-2 border-t border-craftopia-light/30">
        <View className="flex-row items-center">
          {quest.waste_kg && quest.waste_kg > 0 ? (
            <View className="flex-row items-center mr-3">
              <Text className="text-xs text-craftopia-textSecondary">
                🌱 {quest.waste_kg}kg impact
              </Text>
            </View>
          ) : null}
          {quest.participantCount && quest.participantCount > 0 ? (
            <View className="flex-row items-center">
              <Text className="text-xs text-craftopia-textSecondary">
                👥 {quest.participantCount} joined
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center">
          <Text className="text-xs font-semibold text-craftopia-primary mr-1">
            View Details
          </Text>
          <ChevronRight size={14} color="#374A36" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            tintColor="#374A36"
          />
        ) : undefined
      }
    >
      <View className="mx-4 mb-6">
        {/* Section Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
              <Target size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Available Quests
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} waiting
              </Text>
            </View>
          </View>
        </View>

        {/* Quest Items */}
        <View>
          {challenges.map((quest) => (
            <QuestItem key={quest.challenge_id} quest={quest} />
          ))}
        </View>

        {/* Encouragement Card */}
        <View className="bg-craftopia-light rounded-xl p-3 mt-2">
          <Text className="text-xs font-medium text-craftopia-textPrimary text-center">
            💪 Every quest completed makes a difference!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};