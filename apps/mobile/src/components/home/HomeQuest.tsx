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

    const handleChallengeCreated = () => {
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
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
              Today's Quests
            </Text>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary">
              Loading Adventures
            </Text>
          </View>
        </View>

        {[1, 2, 3].map((item) => (
          <View key={item} className="bg-craftopia-surface rounded-xl p-4 mb-2 border border-craftopia-light">
            <View className="flex-row items-center justify-between mb-3">
              <View className="w-20 h-6 rounded-lg bg-craftopia-light" />
              <View className="w-12 h-6 rounded-lg bg-craftopia-light" />
            </View>
            <View className="w-4/5 h-4 rounded mb-2 bg-craftopia-light" />
            <View className="w-full h-3 rounded mb-3 bg-craftopia-light" />
            <View className="w-full h-2 rounded bg-craftopia-light" />
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
          <View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
              Today's Quests
            </Text>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary">
              Your Adventures
            </Text>
          </View>
        </View>

        <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light">
          <View className="w-14 h-14 rounded-xl bg-craftopia-primary/10 items-center justify-center mb-3 border border-craftopia-primary/20">
            <Target size={24} color="#3B6E4D" />
          </View>
          <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-2">
            All Caught Up
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary text-center mb-4">
            New quests will appear tomorrow. Stay tuned for more adventures
          </Text>
          <TouchableOpacity className="px-5 py-2.5 rounded-lg bg-craftopia-primary active:opacity-70">
            <Text className="text-sm font-poppinsBold text-white">Explore More</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const visibleQuests = quests.slice(0, 3);

  const getCategoryIcon = (quest: Quest) => {
    const category = String(quest.category?.toLowerCase() || '');
    if (category.includes('daily')) return <Flame size={14} color="#E3A84F" />;
    if (category.includes('weekly')) return <Calendar size={14} color="#5C89B5" />;
    return <Zap size={14} color="#3B6E4D" />;
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
        className="bg-craftopia-surface rounded-xl p-3 mb-2 border border-craftopia-light active:opacity-70"
        style={{
          backgroundColor: isUpdated ? 'rgba(59, 110, 77, 0.05)' : isCompleted ? 'rgba(59, 110, 77, 0.03)' : '#FFFFFF',
          borderColor: isUpdated ? 'rgba(59, 110, 77, 0.2)' : isCompleted ? 'rgba(59, 110, 77, 0.1)' : '#F5F7F2',
        }}
        onPress={() => onQuestPress?.(quest)}
      >
        {isUpdated && (
          <View className="absolute -top-1 -right-1 px-2 py-0.5 rounded bg-craftopia-primary">
            <Text className="text-xs font-poppinsBold text-white">Updated</Text>
          </View>
        )}

        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center px-2 py-1 rounded-lg bg-craftopia-primary/10 border border-craftopia-primary/20">
            {isCompleted ? <CheckCircle size={12} color="#3B6E4D" /> : getCategoryIcon(quest)}
            <Text className="text-xs font-poppinsBold uppercase tracking-wide ml-1 text-craftopia-textPrimary">
              {isCompleted ? 'Completed' : quest.category || 'Quest'}
            </Text>
          </View>

          <View className="px-2 py-1 rounded-lg bg-craftopia-accent/10 border border-craftopia-accent/20">
            <Text className="text-xs font-poppinsBold text-craftopia-warning">
              +{quest.points_reward ?? quest.points ?? 0}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-1">
          {quest.title}
        </Text>
        <Text className="text-xs font-nunito text-craftopia-textSecondary mb-2" numberOfLines={2}>
          {quest.description || 'Complete this challenge to earn rewards'}
        </Text>

        {/* Progress */}
        {!isCompleted && (
          <View className="mb-2">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs font-nunito text-craftopia-textSecondary">Progress</Text>
              <Text className="text-xs font-poppinsBold text-craftopia-textPrimary">{progress}/{total}</Text>
            </View>

            <View className="h-1.5 rounded-full overflow-hidden bg-craftopia-light">
              <View 
                className="h-full rounded-full bg-craftopia-primary" 
                style={{ width: `${progressPercent}%` }} 
              />
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="flex-row items-center justify-between pt-2 border-t border-craftopia-light">
          <View className="flex-row items-center">
            {!isCompleted ? (
              <>
                <Clock size={12} color="#5F6F64" />
                <Text className="text-xs font-nunito text-craftopia-textSecondary ml-1">In Progress</Text>
              </>
            ) : (
              <>
                <CheckCircle size={12} color="#3B6E4D" />
                <Text className="text-xs font-poppinsBold text-craftopia-textPrimary ml-1">Completed</Text>
              </>
            )}
          </View>

          <View className="flex-row items-center">
            <Text className="text-xs font-poppinsBold text-craftopia-textPrimary mr-1">View</Text>
            <ChevronRight size={12} color="#3B6E4D" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const completedCount = quests.filter(q => q.completed || q.status === 'completed').length;
  const totalCount = quests.length;

  return (
    <View className="px-4 mb-4">
      {/* New Challenge Alert */}
      {newChallengeAlert && (
        <View className="mb-3 p-3 rounded-xl bg-craftopia-primary/10 border border-craftopia-primary/20 flex-row items-center">
          <Zap size={16} color="#3B6E4D" />
          <Text className="text-sm font-poppinsBold text-craftopia-textPrimary ml-2 flex-1">
            New challenge available
          </Text>
        </View>
      )}

      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
            Today's Quests
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary mr-2">
              Your Adventures
            </Text>
            {isConnected && <View className="w-1.5 h-1.5 rounded-full bg-craftopia-success" />}
          </View>
          <Text className="text-xs font-nunito text-craftopia-textSecondary mt-1">
            {completedCount}/{totalCount} completed today
          </Text>
        </View>

        {totalCount > 2 && (
          <TouchableOpacity 
            onPress={onSeeAll} 
            className="flex-row items-center px-3 py-1.5 rounded-lg bg-craftopia-primary/10 active:opacity-70"
          >
            <Text className="text-xs font-poppinsBold text-craftopia-textPrimary mr-1">See All</Text>
            <ChevronRight size={12} color="#3B6E4D" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quest Items */}
      <View className="mb-3">
        {visibleQuests.map((quest, idx) => (
          <QuestItem key={quest.id ?? quest.challenge_id ?? idx} quest={quest} />
        ))}
      </View>
    </View>
  );
};