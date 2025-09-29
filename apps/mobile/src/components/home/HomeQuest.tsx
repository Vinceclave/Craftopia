// HomeQuest.jsx - Enhanced with better interactions
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Animated } from 'react-native';
import { Target, CheckCircle, Clock, ChevronRight } from 'lucide-react-native';

export const HomeQuest = ({ quests = [], loading, onSeeAll, onQuestPress }) => {
  const [animatedValues] = useState(() => 
    quests.map(() => new Animated.Value(1))
  );

  

  const handlePressIn = (index) => {
    Animated.spring(animatedValues[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(animatedValues[index], {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View className="mx-5 mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-craftopia-accent/10 items-center justify-center mr-3">
              <Target size={20} className="text-craftopia-accent" />
            </View>
            <View>
              <Text className="text-xl font-bold text-craftopia-textPrimary">
                Daily Quests
              </Text>
              <Text className="text-sm text-craftopia-textSecondary">
                Complete tasks to earn rewards
              </Text>
            </View>
          </View>
        </View>
        
        {/* Loading Skeletons */}
        {[1, 2, 3].map((item) => (
          <View key={item} className="bg-craftopia-surface rounded-2xl p-4 mb-3 border border-craftopia-light/50">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="w-3/4 h-4 bg-craftopia-light rounded mb-2" />
                <View className="w-1/2 h-3 bg-craftopia-light rounded" />
              </View>
              <View className="w-16 h-8 bg-craftopia-light rounded-lg" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (!quests || quests.length === 0) {
    return (
      <View className="mx-5 mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-craftopia-accent/10 items-center justify-center mr-3">
              <Target size={20} className="text-craftopia-accent" />
            </View>
            <View>
              <Text className="text-xl font-bold text-craftopia-textPrimary">
                Daily Quests
              </Text>
              <Text className="text-sm text-craftopia-textSecondary">
                Complete tasks to earn rewards
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-craftopia-surface rounded-2xl p-8 items-center border border-craftopia-light/50">
          <View className="w-16 h-16 rounded-full bg-craftopia-light/50 items-center justify-center mb-4">
            <Target size={24} className="text-craftopia-textSecondary" />
          </View>
          <Text className="text-lg font-semibold text-craftopia-textPrimary mb-2">
            No Quests Today
          </Text>
          <Text className="text-sm text-craftopia-textSecondary text-center mb-4">
            New quests will appear tomorrow. Check back then!
          </Text>
          <TouchableOpacity className="bg-craftopia-primary rounded-full px-6 py-3">
            <Text className="text-sm font-semibold text-craftopia-surface">
              Explore Crafts
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const visibleQuests = quests.slice(0, 3);

  const QuestItem = ({ quest, index }) => (
    <Animated.View
      style={{
        transform: [{ scale: animatedValues[index] }],
      }}
    >
      <TouchableOpacity
        className={`bg-craftopia-surface rounded-2xl p-4 mb-3 border ${
          quest.completed 
            ? 'border-craftopia-success/30' 
            : 'border-craftopia-light/50'
        } shadow-sm`}
        onPressIn={() => handlePressIn(index)}
        onPressOut={() => handlePressOut(index)}
        onPress={() => onQuestPress?.(quest)}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-2">
              {quest.completed ? (
                <CheckCircle size={16} className="text-craftopia-success mr-2" />
              ) : (
                <Clock size={16} className="text-craftopia-textSecondary mr-2" />
              )}
              <Text className="text-sm font-medium text-craftopia-textSecondary uppercase tracking-wide">
                {quest.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
            <Text className="text-base font-semibold text-craftopia-textPrimary mb-1">
              {quest.title}
            </Text>
            <Text className="text-sm text-craftopia-textSecondary">
              {quest.description || 'Complete to earn points and level up'}
            </Text>
          </View>

          <View className="items-end">
            <View className={`px-3 py-2 rounded-xl ${
              quest.completed 
                ? 'bg-craftopia-success/10' 
                : 'bg-craftopia-primary/10'
            } mb-2`}>
              <Text className={`text-sm font-bold ${
                quest.completed 
                  ? 'text-craftopia-success' 
                  : 'text-craftopia-primary'
              }`}>
                +{quest.points}
              </Text>
            </View>
            <ChevronRight size={16} className="text-craftopia-textSecondary" />
          </View>
        </View>
        
        {/* Progress bar for multi-step quests */}
        {quest.progress && quest.total && (
          <View className="mt-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-craftopia-textSecondary">
                Progress
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                {quest.progress}/{quest.total}
              </Text>
            </View>
            <View className="w-full h-1.5 bg-craftopia-light rounded-full overflow-hidden">
              <View 
                className="h-full bg-craftopia-accent rounded-full"
                style={{ width: `${(quest.progress / quest.total) * 100}%` }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View className="mx-5 mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-2xl bg-craftopia-accent/10 items-center justify-center mr-3">
            <Target size={20} className="text-craftopia-accent" />
          </View>
          <View>
            <Text className="text-xl font-bold text-craftopia-textPrimary">
              Daily Quests
            </Text>
            <Text className="text-sm text-craftopia-textSecondary">
              Complete tasks to earn rewards
            </Text>
          </View>
        </View>
        
        {quests.length > 3 && (
          <TouchableOpacity 
            className="flex-row items-center bg-craftopia-light rounded-full px-4 py-2"
            onPress={onSeeAll}
          >
            <Text className="text-sm font-semibold text-craftopia-primary mr-1">
              See All
            </Text>
            <ChevronRight size={16} className="text-craftopia-primary" />
          </TouchableOpacity>
        )}
      </View>

      <View>
        {visibleQuests.map((quest, index) => (
          <QuestItem key={quest.id || index} quest={quest} index={index} />
        ))}
      </View>

      {/* Completion Stats */}
      <View className="bg-craftopia-light rounded-2xl p-4 mt-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-medium text-craftopia-textPrimary">
            Daily Progress
          </Text>
          <Text className="text-sm font-semibold text-craftopia-primary">
            {quests.filter(q => q.completed).length}/{quests.length} Completed
          </Text>
        </View>
        <View className="w-full h-2 bg-craftopia-surface rounded-full overflow-hidden mt-2">
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