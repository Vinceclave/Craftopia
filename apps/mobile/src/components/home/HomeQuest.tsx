// apps/mobile/src/components/home/HomeQuest.tsx - REAL-TIME VERSION
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Target, CheckCircle, Clock, ChevronRight, Flame, Calendar, Zap } from 'lucide-react-native';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';

export const HomeQuest = ({ quests = [], loading, onSeeAll, onQuestPress, refetch }) => {
  const { on, off, isConnected } = useWebSocket();
  const [newChallengeAlert, setNewChallengeAlert] = useState(false);
  const [updatedChallengeIds, setUpdatedChallengeIds] = useState<Set<number>>(new Set());

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    console.log('🎯 HomeQuest: Setting up real-time listeners');

    // New challenge created
    const handleChallengeCreated = (data: any) => {
      console.log('🆕 HomeQuest: New challenge created:', data);
      setNewChallengeAlert(true);
      setTimeout(() => setNewChallengeAlert(false), 3000);
      refetch?.(); // Refresh challenges list
    };

    // Challenge updated
    const handleChallengeUpdated = (data: any) => {
      console.log('📝 HomeQuest: Challenge updated:', data);
      setUpdatedChallengeIds(prev => new Set(prev).add(data.challenge?.challenge_id));
      setTimeout(() => {
        setUpdatedChallengeIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.challenge?.challenge_id);
          return newSet;
        });
      }, 2000);
      refetch?.();
    };

    // Challenge joined by user
    const handleChallengeJoined = (data: any) => {
      console.log('✅ HomeQuest: Challenge joined:', data);
      refetch?.();
    };

    // Challenge verified
    const handleChallengeVerified = (data: any) => {
      console.log('🎉 HomeQuest: Challenge verified:', data);
      refetch?.();
    };

    // Leaderboard updated
    const handleLeaderboardUpdated = (data: any) => {
      console.log('🏆 HomeQuest: Leaderboard updated:', data);
      // Optionally refresh if needed
    };

    // Register listeners
    on(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
    on(WebSocketEvent.CHALLENGE_UPDATED, handleChallengeUpdated);
    on(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    on(WebSocketEvent.LEADERBOARD_UPDATED, handleLeaderboardUpdated);

    console.log('✅ HomeQuest: Real-time listeners registered');

    // Cleanup
    return () => {
      console.log('🧹 HomeQuest: Removing real-time listeners');
      off(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
      off(WebSocketEvent.CHALLENGE_UPDATED, handleChallengeUpdated);
      off(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
      off(WebSocketEvent.LEADERBOARD_UPDATED, handleLeaderboardUpdated);
    };
  }, [isConnected, on, off, refetch]);

  // Loading State
  if (loading) {
    return (
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View 
              className="w-9 h-9 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
            >
              <Target size={18} color="#374A36" />
            </View>
            <View>
              <Text className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
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
            className="bg-white rounded-xl p-4 mb-2"
            style={{ backgroundColor: '#F9FAFB' }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="w-16 h-5 rounded-lg" style={{ backgroundColor: '#E5E7EB' }} />
              <View className="w-12 h-6 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
            </View>
            <View className="w-4/5 h-4 rounded mb-2" style={{ backgroundColor: '#E5E7EB' }} />
            <View className="w-full h-3 rounded mb-3" style={{ backgroundColor: '#E5E7EB' }} />
            <View className="w-full h-2 rounded" style={{ backgroundColor: '#E5E7EB' }} />
          </View>
        ))}
      </View>
    );
  }

  // Empty State
  if (!quests || quests.length === 0) {
    return (
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View 
              className="w-9 h-9 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
            >
              <Target size={18} color="#374A36" />
            </View>
            <View>
              <Text className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                Daily Quests
              </Text>
              <Text className="text-xs" style={{ color: '#9CA3AF' }}>
                No active quests today
              </Text>
            </View>
          </View>
        </View>
        
        <View 
          className="bg-white rounded-2xl p-6 items-center"
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View 
            className="w-14 h-14 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <Target size={24} color="#9CA3AF" />
          </View>
          <Text className="text-base font-bold mb-1" style={{ color: '#1A1A1A' }}>
            All Caught Up!
          </Text>
          <Text className="text-sm text-center mb-4" style={{ color: '#6B7280' }}>
            New quests will appear tomorrow. Check back then!
          </Text>
          <TouchableOpacity 
            className="px-5 py-2.5 rounded-xl"
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
    if (category.includes('daily')) return <Flame size={12} color="#F59E0B" />;
    if (category.includes('weekly')) return <Calendar size={12} color="#3B82F6" />;
    return <Zap size={12} color="#374A36" />;
  };

  const QuestItem = ({ quest, index }) => {
    const isCompleted = quest.completed || quest.status === 'completed';
    const progress = quest.progress || 0;
    const total = quest.total || 1;
    const progressPercent = (progress / total) * 100;
    const isUpdated = updatedChallengeIds.has(quest.challenge_id || quest.id);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-4 mb-2"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isCompleted ? 0.03 : 0.05,
          shadowRadius: 8,
          elevation: 2,
          backgroundColor: isUpdated ? 'rgba(55, 74, 54, 0.08)' : isCompleted ? 'rgba(55, 74, 54, 0.03)' : '#FFFFFF',
          borderWidth: isCompleted || isUpdated ? 1 : 0,
          borderColor: isUpdated ? 'rgba(55, 74, 54, 0.3)' : isCompleted ? 'rgba(55, 74, 54, 0.15)' : 'transparent',
          transform: isUpdated ? [{ scale: 1.02 }] : [{ scale: 1 }],
        }}
        onPress={() => onQuestPress?.(quest)}
        activeOpacity={0.7}
      >
        {/* "Updated" Badge */}
        {isUpdated && (
          <View 
            className="absolute -top-2 -right-2 px-2 py-1 rounded-full"
            style={{ backgroundColor: '#374A36' }}
          >
            <Text className="text-xs font-bold text-white">
              Updated!
            </Text>
          </View>
        )}

        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          {/* Status Badge */}
          <View 
            className="flex-row items-center px-2.5 py-1 rounded-full"
            style={{ 
              backgroundColor: isCompleted 
                ? 'rgba(55, 74, 54, 0.1)' 
                : 'rgba(55, 74, 54, 0.08)',
              borderWidth: 1,
              borderColor: isCompleted 
                ? 'rgba(55, 74, 54, 0.2)' 
                : 'rgba(55, 74, 54, 0.15)',
            }}
          >
            {isCompleted ? (
              <CheckCircle size={11} color="#374A36" />
            ) : (
              getCategoryIcon(quest)
            )}
            <Text 
              className="text-xs font-bold uppercase tracking-wide ml-1"
              style={{ color: '#374A36' }}
            >
              {isCompleted ? 'Done' : quest.category || 'Quest'}
            </Text>
          </View>

          {/* Points Badge */}
          <View 
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(212, 169, 106, 0.15)' }}
          >
            <Text className="text-xs font-bold" style={{ color: '#D4A96A' }}>
              +{quest.points_rewards || quest.points || 0}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text className="text-sm font-bold mb-1" style={{ color: '#1A1A1A' }}>
          {quest.title}
        </Text>
        <Text className="text-xs mb-3" style={{ color: '#6B7280' }} numberOfLines={2}>
          {quest.description || 'Complete this challenge to earn rewards'}
        </Text>

        {/* Progress Bar */}
        {!isCompleted && progress !== undefined && total !== undefined && (
          <View className="mb-3">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                Progress
              </Text>
              <Text className="text-xs font-bold" style={{ color: '#374A36' }}>
                {progress}/{total}
              </Text>
            </View>
            <View 
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: '#E5E7EB' }}
            >
              <View 
                className="h-full rounded-full"
                style={{ 
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: '#374A36',
                }}
              />
            </View>
          </View>
        )}

        {/* Footer */}
        <View 
          className="flex-row items-center justify-between pt-3"
          style={{ 
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}
        >
          <View className="flex-row items-center">
            {!isCompleted ? (
              <>
                <Clock size={13} color="#9CA3AF" />
                <Text className="text-xs font-medium ml-1.5" style={{ color: '#6B7280' }}>
                  In Progress
                </Text>
              </>
            ) : (
              <>
                <CheckCircle size={13} color="#374A36" />
                <Text className="text-xs font-semibold ml-1.5" style={{ color: '#374A36' }}>
                  Completed!
                </Text>
              </>
            )}
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-xs font-bold mr-0.5" style={{ color: '#374A36' }}>
              View
            </Text>
            <ChevronRight size={12} color="#374A36" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const completedCount = quests.filter(q => q.completed || q.status === 'completed').length;
  const totalCount = quests.length;
  const completionPercent = (completedCount / totalCount) * 100;

  return (
    <View className="px-4 mb-4">
      {/* New Challenge Alert */}
      {newChallengeAlert && (
        <View 
          className="mb-3 p-3 rounded-xl flex-row items-center"
          style={{ 
            backgroundColor: 'rgba(55, 74, 54, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(55, 74, 54, 0.3)',
          }}
        >
          <Zap size={16} color="#374A36" />
          <Text className="text-sm font-bold ml-2 flex-1" style={{ color: '#374A36' }}>
            New challenge available! 🎯
          </Text>
        </View>
      )}

      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View 
            className="w-9 h-9 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
          >
            <Target size={18} color="#374A36" />
          </View>
          <View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                Daily Quests
              </Text>
              {isConnected && (
                <View className="w-2 h-2 rounded-full bg-green-500 ml-2" />
              )}
            </View>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              {completedCount}/{totalCount} completed today
            </Text>
          </View>
        </View>
        
        {totalCount > 3 && (
          <TouchableOpacity 
            className="flex-row items-center px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#F3F4F6' }}
            onPress={onSeeAll}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-bold mr-0.5" style={{ color: '#374A36' }}>
              See All
            </Text>
            <ChevronRight size={12} color="#374A36" />
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
      <View 
        className="bg-white rounded-xl p-4"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-bold" style={{ color: '#1A1A1A' }}>
            Daily Progress
          </Text>
          <Text className="text-sm font-bold" style={{ color: '#374A36' }}>
            {Math.round(completionPercent)}%
          </Text>
        </View>
        <View 
          className="h-1.5 rounded-full overflow-hidden mb-2"
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