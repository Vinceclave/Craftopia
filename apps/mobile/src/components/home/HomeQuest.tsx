import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Target, CheckCircle, Clock, ChevronRight, Flame, Calendar, Zap, Sparkles } from 'lucide-react-native';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';

type Quest = {
  id?: number;
  challenge_id?: number;
  title: string;
  description?: string;
  category?: string;
  points_reward?: number;
  points?: number;
  completed?: boolean;
  status?: string;
  progress?: number;
  total?: number;
};

interface HomeQuestProps {
  quests: Quest[];
  loading: boolean;
  onSeeAll?: () => void;
  onQuestPress?: (quest: Quest) => void;
  refetch?: () => void | Promise<void>;
}

export const HomeQuest: React.FC<HomeQuestProps> = ({ quests = [], loading, onSeeAll, onQuestPress, refetch }) => {
  const { on, off, isConnected } = useWebSocket();
  const [newChallengeAlert, setNewChallengeAlert] = useState(false);
  const [updatedChallengeIds, setUpdatedChallengeIds] = useState<Set<number>>(new Set());

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handleChallengeCreated = (data: any) => {
      setNewChallengeAlert(true);
      setTimeout(() => setNewChallengeAlert(false), 3000);
      refetch?.();
    };

    const handleChallengeUpdated = (data: any) => {
      const id = data.challenge?.challenge_id;
      if (id) {
        setUpdatedChallengeIds(prev => new Set(prev).add(id));
        setTimeout(() => {
          setUpdatedChallengeIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }, 2000);
      }
      refetch?.();
    };

    const handleChallengeJoined = () => refetch?.();
    const handleChallengeVerified = () => refetch?.();

    on(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
    on(WebSocketEvent.CHALLENGE_UPDATED, handleChallengeUpdated);
    on(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);

    return () => {
      off(WebSocketEvent.CHALLENGE_CREATED, handleChallengeCreated);
      off(WebSocketEvent.CHALLENGE_UPDATED, handleChallengeUpdated);
      off(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    };
  }, [isConnected, on, off, refetch]);

  // Loading State
  if (loading) {
    return (
      <View className="px-6 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-sm font-nunito text-craftopa-textSecondary tracking-wide mb-1">
              Today's Quests
            </Text>
            <Text className="text-lg font-poppinsBold text-craftopa-textPrimary tracking-tight">
              Loading Adventures
            </Text>
          </View>
        </View>

        {[1, 2, 3].map((item) => (
          <View key={item} className="bg-white rounded-2xl p-5 mb-3 shadow-sm shadow-craftopa-light/10 border border-craftopa-light/5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-20 h-6 rounded-lg bg-craftopa-light/10" />
              <View className="w-12 h-6 rounded-lg bg-craftopa-light/10" />
            </View>
            <View className="w-4/5 h-4 rounded mb-2 bg-craftopa-light/10" />
            <View className="w-full h-3 rounded mb-4 bg-craftopa-light/10" />
            <View className="w-full h-2 rounded bg-craftopa-light/10" />
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
          <View>
            <Text className="text-sm font-nunito text-craftopa-textSecondary tracking-wide mb-1">
              Today's Quests
            </Text>
            <Text className="text-lg font-poppinsBold text-craftopa-textPrimary tracking-tight">
              Your Adventures
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl p-8 items-center shadow-sm shadow-craftopa-light/10 border border-craftopa-light/5">
          <View className="w-16 h-16 rounded-2xl bg-craftopa-primary/5 items-center justify-center mb-4 border border-craftopa-light/10">
            <Target size={28} color="#5A7160" opacity={0.7} />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopa-textPrimary mb-2 tracking-tight">
            All Caught Up!
          </Text>
          <Text className="text-sm font-nunito text-craftopa-textSecondary text-center mb-6 tracking-wide">
            New quests will appear tomorrow. Stay tuned for more adventures!
          </Text>
          <TouchableOpacity className="px-6 py-3 rounded-xl bg-craftopa-primary active:opacity-70">
            <Text className="text-sm font-poppinsBold text-white">Explore More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const visibleQuests = quests.slice(0, 3);

  const getCategoryIcon = (quest: Quest) => {
    const category = quest.category?.toLowerCase() || '';
    if (category.includes('daily')) return <Flame size={14} color="#F59E0B" />;
    if (category.includes('weekly')) return <Calendar size={14} color="#3B82F6" />;
    return <Zap size={14} color="#5A7160" />;
  };

    const QuestItem: React.FC<{ quest: Quest }> = ({ quest }) => {
    const isCompleted = quest.completed || quest.status === 'completed';
    const progress = quest.progress ?? 0;
    const total = quest.total ?? 1;
    const progressPercent = (progress / total) * 100;

    const challengeKey = (quest.challenge_id ?? quest.id) ?? -1;
    const isUpdated = updatedChallengeIds.has(challengeKey);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl p-3.5 mb-2 shadow-sm border border-craftopa-light/5 active:opacity-70"
        style={{
          backgroundColor: isUpdated ? 'rgba(90, 113, 96, 0.05)' : isCompleted ? 'rgba(90, 113, 96, 0.03)' : '#FFFFFF',
          borderColor: isUpdated ? 'rgba(90, 113, 96, 0.2)' : isCompleted ? 'rgba(90, 113, 96, 0.1)' : 'rgba(90, 113, 96, 0.05)',
          transform: isUpdated ? [{ scale: 1.02 }] : [{ scale: 1 }],
        }}
        onPress={() => onQuestPress?.(quest)}
      >
        {isUpdated && (
          <View className="absolute -top-1 -right-1 px-2 py-0.5 rounded bg-craftopa-primary shadow-sm">
            <Text className="text-xs font-poppinsBold text-white">Updated!</Text>
          </View>
        )}

        {/* Header */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center px-2 py-1 rounded-lg bg-craftopa-primary/5 border border-craftopa-primary/10">
            {isCompleted ? <CheckCircle size={12} color="#5A7160" /> : getCategoryIcon(quest)}
            <Text className="text-xs font-poppinsBold uppercase tracking-wide ml-1 text-craftopa-textPrimary">
              {isCompleted ? 'Completed' : quest.category || 'Quest'}
            </Text>
          </View>

          <View className="px-2 py-1 rounded-lg bg-craftopa-accent/10 border border-craftopa-accent/10">
            <Text className="text-xs font-poppinsBold text-craftopa-accent">
              +{quest.points_reward ?? quest.points ?? 0}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text className="text-sm font-poppinsBold text-craftopa-textPrimary mb-1.5 tracking-tight">
          {quest.title}
        </Text>
        <Text className="text-xs font-nunito text-craftopa-textSecondary mb-3 tracking-wide" numberOfLines={2}>
          {quest.description || 'Complete this challenge to earn rewards'}
        </Text>

        {/* Progress */}
        {!isCompleted && (
          <View className="mb-2.5">
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">Progress</Text>
              <Text className="text-xs font-poppinsBold text-craftopa-textPrimary">{progress}/{total}</Text>
            </View>

            <View className="h-1.5 rounded-full overflow-hidden bg-craftopa-light/10">
              <View 
                className="h-full rounded-full bg-craftopa-primary" 
                style={{ width: `${progressPercent}%` }} 
              />
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-2.5 border-t border-craftopa-light/10">
          <View className="flex-row items-center">
            {!isCompleted ? (
              <>
                <Clock size={12} color="#6B7280" />
                <Text className="text-xs font-nunito text-craftopa-textSecondary ml-1.5 tracking-wide">In Progress</Text>
              </>
            ) : (
              <>
                <CheckCircle size={12} color="#5A7160" />
                <Text className="text-xs font-poppinsBold text-craftopa-textPrimary ml-1.5">Completed!</Text>
              </>
            )}
          </View>

          <View className="flex-row items-center">
            <Text className="text-xs font-poppinsBold text-craftopa-textPrimary mr-0.5">View</Text>
            <ChevronRight size={12} color="#5A7160" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const completedCount = quests.filter(q => q.completed || q.status === 'completed').length;
  const totalCount = quests.length;
  const completionPercent = (completedCount / totalCount) * 100;

  return (
    <View className="px-5 mb-4">
      {/* New Challenge Alert */}
      {newChallengeAlert && (
        <View className="mb-3 p-3 rounded-xl bg-gradient-to-r from-craftopa-primary/10 to-craftopa-accent/5 border border-craftopa-primary/20 flex-row items-center">
          <Zap size={16} color="#5A7160" />
          <Text className="text-sm font-poppinsBold text-craftopa-textPrimary ml-2 flex-1 tracking-tight">
            New challenge available! 🎯
          </Text>
        </View>
      )}

      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
            Today's Quests
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base font-poppinsBold text-craftopa-textPrimary tracking-tight mr-1.5">
              Your Adventures
            </Text>
            {isConnected && <View className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" />}
          </View>
          <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mt-0.5">
            {completedCount}/{totalCount} completed today
          </Text>
        </View>

        {totalCount > 2 && ( // Updated from 3 to 2
          <TouchableOpacity 
            onPress={onSeeAll} 
            className="flex-row items-center px-3 py-1.5 rounded-lg bg-craftopa-primary/5 active:opacity-70"
          >
            <Text className="text-xs font-poppinsBold text-craftopa-textPrimary mr-1">See All</Text>
            <ChevronRight size={12} color="#5A7160" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quest Items */}
      <View className="mb-3">
        {visibleQuests.map((quest, idx) => (
          <QuestItem key={quest.id ?? quest.challenge_id ?? idx} quest={quest} />
        ))}
      </View>

      {/* Progress Summary */}
      <View className="bg-white rounded-xl p-3.5 shadow-sm border border-craftopa-light/5">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-poppinsBold text-craftopa-textPrimary tracking-tight">Daily Progress</Text>
          <Text className="text-sm font-poppinsBold text-craftopa-textPrimary">{Math.round(completionPercent)}%</Text>
        </View>

        <View className="h-1.5 rounded-full overflow-hidden bg-craftopa-light/10 mb-2">
          <View 
            className="h-full rounded-full bg-gradient-to-r from-craftopa-primary to-craftopa-accent" 
            style={{ width: `${completionPercent}%` }} 
          />
        </View>

        <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
          {completedCount === totalCount
            ? '🎉 All quests completed! Amazing work!'
            : `Keep going! ${totalCount - completedCount} quest${totalCount - completedCount > 1 ? 's' : ''} remaining.`}
        </Text>
      </View>
    </View>
  );
};