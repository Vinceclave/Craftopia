// HomeQuest.tsx - REDESIGNED with improved card design
import React from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Target, CheckCircle, Clock, ChevronRight, Flame, Calendar } from 'lucide-react-native';

export const HomeQuest = ({ quests = [], loading, onSeeAll, onQuestPress }) => {
  // Loading State
  if (loading) {
    return (
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-craftopia-accent/10 items-center justify-center mr-2">
              <Target size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Daily Quests
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                Loading your challenges...
              </Text>
            </View>
          </View>
        </View>
        
        {/* Loading Skeletons */}
        {[1, 2, 3].map((item) => (
          <View key={item} className="bg-craftopia-surface rounded-xl p-4 mb-2 border border-craftopia-light/50">
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-16 h-5 bg-craftopia-light rounded" />
              <View className="w-12 h-6 bg-craftopia-light rounded" />
            </View>
            <View className="w-4/5 h-4 bg-craftopia-light rounded mb-2" />
            <View className="w-full h-3 bg-craftopia-light rounded mb-3" />
            <View className="w-full h-1 bg-craftopia-light rounded" />
          </View>
        ))}
      </View>
    );
  }

  // Empty State
  if (!quests || quests.length === 0) {
    return (
      <View className="px-4 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-craftopia-accent/10 items-center justify-center mr-2">
              <Target size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Daily Quests
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                No active quests today
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light/50">
          <View className="w-14 h-14 rounded-full bg-craftopia-light/50 items-center justify-center mb-3">
            <Target size={24} color="#5D6B5D" />
          </View>
          <Text className="text-base font-semibold text-craftopia-textPrimary mb-1">
            All Caught Up!
          </Text>
          <Text className="text-sm text-craftopia-textSecondary text-center mb-3">
            New quests will appear tomorrow. Check back then!
          </Text>
          <TouchableOpacity className="bg-craftopia-primary rounded-full px-5 py-2.5">
            <Text className="text-sm font-semibold text-white">
              Explore More
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const visibleQuests = quests.slice(0, 3);

  const getCategoryIcon = (quest) => {
    const category = quest.category?.toLowerCase() || '';
    if (category.includes('daily')) return <Flame size={14} color="#F59E0B" />;
    if (category.includes('weekly')) return <Calendar size={14} color="#3B82F6" />;
    return <Target size={14} color="#D4A96A" />;
  };

  const QuestItem = ({ quest, index }) => {
    const isCompleted = quest.completed || quest.status === 'completed';
    const progress = quest.progress || 0;
    const total = quest.total || 1;
    const progressPercent = (progress / total) * 100;

    return (
      <TouchableOpacity
        className={`bg-craftopia-surface rounded-xl p-4 mb-2 border ${
          isCompleted 
            ? 'border-craftopia-success/30 bg-craftopia-success/5' 
            : 'border-craftopia-light/50'
        }`}
        onPress={() => onQuestPress?.(quest)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          {/* Status Badge */}
          <View className={`flex-row items-center px-2.5 py-1 rounded-full ${
            isCompleted 
              ? 'bg-craftopia-success/10 border border-craftopia-success/20' 
              : 'bg-craftopia-accent/10 border border-craftopia-accent/20'
          }`}>
            {isCompleted ? (
              <CheckCircle size={12} color="#4A7C59" />
            ) : (
              getCategoryIcon(quest)
            )}
            <Text className={`text-xs font-semibold uppercase tracking-wide ml-1 ${
              isCompleted ? 'text-craftopia-success' : 'text-craftopia-accent'
            }`}>
              {isCompleted ? 'Done' : quest.category || 'Quest'}
            </Text>
          </View>

          {/* Points Badge */}
          <View className="bg-craftopia-primary/10 rounded-full px-2.5 py-1">
            <Text className="text-sm font-bold text-craftopia-primary">
              +{quest.points_rewards || quest.points || 0}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text className="text-base font-semibold text-craftopia-textPrimary mb-1.5">
          {quest.title}
        </Text>
        <Text className="text-sm text-craftopia-textSecondary mb-3" numberOfLines={2}>
          {quest.description || 'Complete this challenge to earn rewards'}
        </Text>

        {/* Progress Bar */}
        {!isCompleted && progress !== undefined && total !== undefined && (
          <View className="mb-3">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs font-medium text-craftopia-textSecondary">
                Progress
              </Text>
              <Text className="text-xs font-semibold text-craftopia-primary">
                {progress}/{total}
              </Text>
            </View>
            <View className="h-2 bg-craftopia-light rounded-full overflow-hidden">
              <View 
                className="h-full bg-craftopia-accent rounded-full"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-3 border-t border-craftopia-light/50">
          <View className="flex-row items-center">
            {!isCompleted ? (
              <>
                <Clock size={14} color="#5D6B5D" />
                <Text className="text-xs text-craftopia-textSecondary ml-1.5">
                  In Progress
                </Text>
              </>
            ) : (
              <>
                <CheckCircle size={14} color="#4A7C59" />
                <Text className="text-xs text-craftopia-success ml-1.5 font-medium">
                  Completed!
                </Text>
              </>
            )}
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
  };

  const completedCount = quests.filter(q => q.completed || q.status === 'completed').length;
  const totalCount = quests.length;
  const completionPercent = (completedCount / totalCount) * 100;

  return (
    <View className="px-4 mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full bg-craftopia-accent/10 items-center justify-center mr-2">
            <Target size={18} color="#D4A96A" />
          </View>
          <View>
            <Text className="text-lg font-bold text-craftopia-textPrimary">
              Daily Quests
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              {completedCount}/{totalCount} completed today
            </Text>
          </View>
        </View>
        
        {totalCount > 3 && (
          <TouchableOpacity 
            className="flex-row items-center bg-craftopia-light rounded-full px-3 py-2"
            onPress={onSeeAll}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-semibold text-craftopia-primary mr-1">
              See All
            </Text>
            <ChevronRight size={14} color="#374A36" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quest Cards */}
      <View className="mb-3">
        {visibleQuests.map((quest, index) => (
          <QuestItem key={quest.id || index} quest={quest} index={index} />
        ))}
      </View>

      {/* Daily Progress Summary */}
      <View className="bg-craftopia-surface rounded-xl p-4 border border-craftopia-light/50">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-semibold text-craftopia-textPrimary">
            Daily Progress
          </Text>
          <Text className="text-sm font-bold text-craftopia-primary">
            {Math.round(completionPercent)}%
          </Text>
        </View>
        <View className="h-2 bg-craftopia-light rounded-full overflow-hidden mb-2">
          <View 
            className="h-full bg-craftopia-primary rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </View>
        <Text className="text-xs text-craftopia-textSecondary">
          {completedCount === totalCount 
            ? '🎉 All quests completed! Come back tomorrow for more.' 
            : `Keep going! ${totalCount - completedCount} quest${totalCount - completedCount !== 1 ? 's' : ''} remaining.`
          }
        </Text>
      </View>
    </View>
  );
};