// HomeQuest.jsx - Optimized for mobile
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Target, CheckCircle, Clock, ChevronRight } from 'lucide-react-native';

export const HomeQuest = ({ quests = [], loading, onSeeAll, onQuestPress }) => {
  if (loading) {
    return (
      <View className="mx-4 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
              <Target size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Daily Quests
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                Complete tasks to earn rewards
              </Text>
            </View>
          </View>
        </View>
        
        {/* Loading Skeletons */}
        {[1, 2, 3].map((item) => (
          <View key={item} className="bg-craftopia-surface rounded-xl p-3 mb-2 border border-craftopia-light/50">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="w-3/4 h-3.5 bg-craftopia-light rounded mb-1.5" />
                <View className="w-1/2 h-3 bg-craftopia-light rounded" />
              </View>
              <View className="w-14 h-7 bg-craftopia-light rounded-lg" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (!quests || quests.length === 0) {
    return (
      <View className="mx-4 mb-6">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
              <Target size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Daily Quests
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                Complete tasks to earn rewards
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light/50">
          <View className="w-12 h-12 rounded-full bg-craftopia-light/50 items-center justify-center mb-3">
            <Target size={20} color="#5D6B5D" />
          </View>
          <Text className="text-base font-semibold text-craftopia-textPrimary mb-1">
            No Quests Today
          </Text>
          <Text className="text-xs text-craftopia-textSecondary text-center mb-3">
            New quests will appear tomorrow. Check back then!
          </Text>
          <TouchableOpacity className="bg-craftopia-primary rounded-full px-4 py-2">
            <Text className="text-xs font-semibold text-craftopia-surface">
              Explore Crafts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const visibleQuests = quests.slice(0, 3);

  console.log(visibleQuests)

  const QuestItem = ({ quest, index }) => (
    <TouchableOpacity
      className={`bg-craftopia-surface rounded-xl p-3 mb-2 border ${
        quest.completed 
          ? 'border-craftopia-success/30' 
          : 'border-craftopia-light/50'
      }`}
      onPress={() => onQuestPress?.(quest)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            {quest.completed ? (
              <CheckCircle size={14} color="#4A7C59" style={{ marginRight: 4 }} />
            ) : (
              <Clock size={14} color="#5D6B5D" style={{ marginRight: 4 }} />
            )}
            <Text className="text-xs font-medium text-craftopia-textSecondary uppercase tracking-wide">
              {quest.completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>
          <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1">
            {quest.title}
          </Text>
          <Text className="text-xs text-craftopia-textSecondary">
            {quest.description || 'Complete to earn points and level up'}
          </Text>
        </View>

        <View className="items-end">
          <View className={`px-2 py-1.5 rounded-lg ${
            quest.completed 
              ? 'bg-craftopia-success/10' 
              : 'bg-craftopia-primary/10'
          } mb-1`}>
            <Text className={`text-xs font-bold ${
              quest.completed 
                ? 'text-craftopia-success' 
                : 'text-craftopia-primary'
            }`}>
              +{quest.points_rewards}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Progress bar for multi-step quests */}
      {quest.progress && quest.total && (
        <View className="mt-2">
          <View className="flex-row justify-between mb-1">
            <Text className="text-xs text-craftopia-textSecondary">
              Progress
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              {quest.progress}/{quest.total}
            </Text>
          </View>
          <View className="w-full h-1 bg-craftopia-light rounded-full overflow-hidden">
            <View 
              className="h-full bg-craftopia-accent rounded-full"
              style={{ width: `${(quest.progress / quest.total) * 100}%` }}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="mx-4 mb-6">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
            <Target size={18} color="#D4A96A" />
          </View>
          <View>
            <Text className="text-lg font-bold text-craftopia-textPrimary">
              Daily Quests
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              Complete tasks to earn rewards
            </Text>
          </View>
        </View>
        
        {quests.length > 3 && (
          <TouchableOpacity 
            className="flex-row items-center bg-craftopia-light rounded-full px-3 py-1.5"
            onPress={onSeeAll}
          >
            <Text className="text-xs font-semibold text-craftopia-primary mr-1">
              See All
            </Text>
            <ChevronRight size={14} color="#374A36" />
          </TouchableOpacity>
        )}
      </View>

      <View>
        {visibleQuests.map((quest, index) => (
          <QuestItem key={quest.id || index} quest={quest} index={index} />
        ))}
      </View>

      {/* Completion Stats */}
      <View className="bg-craftopia-light rounded-xl p-3 mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-xs font-medium text-craftopia-textPrimary">
            Daily Progress
          </Text>
          <Text className="text-xs font-semibold text-craftopia-primary">
            {quests.filter(q => q.completed).length}/{quests.length} Completed
          </Text>
        </View>
        <View className="w-full h-1.5 bg-craftopia-surface rounded-full overflow-hidden mt-1.5">
          <View 
            className="h-full bg-craftopia-primary rounded-full"
            style={{ 
              width: `${(quests.filter(q => q.completed).length / quests.length) * 100}%` 
            }}
          />
        </View>
      </View>
    </View>
  );
};