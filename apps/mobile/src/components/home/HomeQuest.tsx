// apps/mobile/src/components/home/HomeQuest.tsx
import React from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Target, CheckCircle, Clock, ChevronRight, Flame, Calendar, Zap } from 'lucide-react-native';

export const HomeQuest = ({ quests = [], loading, onSeeAll, onQuestPress }) => {
  // Loading State
  if (loading) {
    return (
      <View className="px-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View 
              className="w-11 h-11 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: 'rgba(212, 169, 106, 0.15)' }}
            >
              <Target size={20} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                Daily Quests
              </Text>
              <Text className="text-xs" style={{ color: '#9CA3AF' }}>
                Loading your challenges...
              </Text>
            </View>
          </View>
        </View>
        
        {/* Loading Skeletons */}
        {[1, 2, 3].map((item) => (
          <View 
            key={item} 
            className="bg-white rounded-2xl p-5 mb-3"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-20 h-6 rounded-lg" style={{ backgroundColor: '#E5E7EB' }} />
              <View className="w-14 h-7 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
            </View>
            <View className="w-4/5 h-5 rounded mb-2" style={{ backgroundColor: '#E5E7EB' }} />
            <View className="w-full h-4 rounded mb-4" style={{ backgroundColor: '#E5E7EB' }} />
            <View className="w-full h-2 rounded" style={{ backgroundColor: '#E5E7EB' }} />
          </View>
        ))}
      </View>
    );
  }

  // Empty State
  if (!quests || quests.length === 0) {
    return (
      <View className="px-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View 
              className="w-11 h-11 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: 'rgba(212, 169, 106, 0.15)' }}
            >
              <Target size={20} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                Daily Quests
              </Text>
              <Text className="text-xs" style={{ color: '#9CA3AF' }}>
                No active quests today
              </Text>
            </View>
          </View>
        </View>
        
        <View 
          className="bg-white rounded-3xl p-8 items-center"
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View 
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <Target size={28} color="#9CA3AF" />
          </View>
          <Text className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>
            All Caught Up!
          </Text>
          <Text className="text-sm text-center mb-5" style={{ color: '#6B7280' }}>
            New quests will appear tomorrow. Check back then!
          </Text>
          <TouchableOpacity 
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: '#374A36' }}
            activeOpacity={0.8}
          >
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
    return <Zap size={14} color="#D4A96A" />;
  };

  const QuestItem = ({ quest, index }) => {
    const isCompleted = quest.completed || quest.status === 'completed';
    const progress = quest.progress || 0;
    const total = quest.total || 1;
    const progressPercent = (progress / total) * 100;

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-5 mb-3"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isCompleted ? 0.03 : 0.05,
          shadowRadius: 8,
          elevation: 2,
          backgroundColor: isCompleted ? 'rgba(74, 124, 89, 0.03)' : '#FFFFFF',
          borderWidth: isCompleted ? 1 : 0,
          borderColor: isCompleted ? 'rgba(74, 124, 89, 0.2)' : 'transparent',
        }}
        onPress={() => onQuestPress?.(quest)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          {/* Status Badge */}
          <View 
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ 
              backgroundColor: isCompleted 
                ? 'rgba(74, 124, 89, 0.1)' 
                : 'rgba(212, 169, 106, 0.1)',
              borderWidth: 1,
              borderColor: isCompleted 
                ? 'rgba(74, 124, 89, 0.2)' 
                : 'rgba(212, 169, 106, 0.2)',
            }}
          >
            {isCompleted ? (
              <CheckCircle size={13} color="#4A7C59" />
            ) : (
              getCategoryIcon(quest)
            )}
            <Text 
              className="text-xs font-bold uppercase tracking-wide ml-1.5"
              style={{ 
                color: isCompleted ? '#4A7C59' : '#D4A96A'
              }}
            >
              {isCompleted ? 'Done' : quest.category || 'Quest'}
            </Text>
          </View>

          {/* Points Badge */}
          <View 
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
          >
            <Text className="text-sm font-bold" style={{ color: '#374A36' }}>
              +{quest.points_rewards || quest.points || 0}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text className="text-base font-bold mb-2" style={{ color: '#1A1A1A' }}>
          {quest.title}
        </Text>
        <Text className="text-sm mb-4" style={{ color: '#6B7280' }} numberOfLines={2}>
          {quest.description || 'Complete this challenge to earn rewards'}
        </Text>

        {/* Progress Bar */}
        {!isCompleted && progress !== undefined && total !== undefined && (
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Progress
              </Text>
              <Text className="text-xs font-bold" style={{ color: '#374A36' }}>
                {progress}/{total}
              </Text>
            </View>
            <View 
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: '#E5E7EB' }}
            >
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: '#D4A96A',
                }}
              />
            </View>
          </View>
        )}

        {/* Footer */}
        <View 
          className="flex-row items-center justify-between pt-4"
          style={{ 
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}
        >
          <View className="flex-row items-center">
            {!isCompleted ? (
              <>
                <Clock size={15} color="#9CA3AF" />
                <Text className="text-xs font-medium ml-2" style={{ color: '#6B7280' }}>
                  In Progress
                </Text>
              </>
            ) : (
              <>
                <CheckCircle size={15} color="#4A7C59" />
                <Text className="text-xs font-semibold ml-2" style={{ color: '#4A7C59' }}>
                  Completed!
                </Text>
              </>
            )}
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-xs font-bold mr-1" style={{ color: '#374A36' }}>
              View
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
    <View className="px-6 mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View 
            className="w-11 h-11 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(212, 169, 106, 0.15)' }}
          >
            <Target size={20} color="#D4A96A" />
          </View>
          <View>
            <Text className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
              Daily Quests
            </Text>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              {completedCount}/{totalCount} completed today
            </Text>
          </View>
        </View>
        
        {totalCount > 3 && (
          <TouchableOpacity 
            className="flex-row items-center px-4 py-2 rounded-full"
            style={{ backgroundColor: '#F3F4F6' }}
            onPress={onSeeAll}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold mr-1" style={{ color: '#374A36' }}>
              See All
            </Text>
            <ChevronRight size={14} color="#374A36" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quest Cards */}
      <View className="mb-4">
        {visibleQuests.map((quest, index) => (
          <QuestItem key={quest.id || index} quest={quest} index={index} />
        ))}
      </View>

      {/* Daily Progress Summary */}
      <View 
        className="bg-white rounded-2xl p-5"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
            Daily Progress
          </Text>
          <Text className="text-sm font-bold" style={{ color: '#374A36' }}>
            {Math.round(completionPercent)}%
          </Text>
        </View>
        <View 
          className="h-2 rounded-full overflow-hidden mb-3"
          style={{ backgroundColor: '#E5E7EB' }}
        >
          <View 
            className="h-full rounded-full"
            style={{ 
              width: `${completionPercent}%`,
              backgroundColor: '#374A36',
            }}
          />
        </View>
        <Text className="text-xs" style={{ color: '#6B7280' }}>
          {completedCount === totalCount 
            ? '🎉 All quests completed! Come back tomorrow for more.' 
            : `Keep going! ${totalCount - completedCount} quest${totalCount - completedCount !== 1 ? 's' : ''} remaining.`
          }
        </Text>
      </View>
    </View>
  );
};