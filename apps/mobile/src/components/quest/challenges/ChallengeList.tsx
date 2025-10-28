// ChallengeList.tsx - Redesigned to match HomeQuest style
import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, Clock, CheckCircle, XCircle, HourglassIcon, ChevronRight } from 'lucide-react-native';
import { EcoQuestStackParamList } from '~/navigations/types';

interface Challenge {
  id: number;
  challenge_id: number;
  title: string;
  description?: string;
  completedAt?: string | null;
  points?: number;
  status: 'in_progress' | 'pending_verification' | 'rejected' | 'completed';
}

interface ChallengeListProps {
  challenges: Challenge[];
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onRetry?: () => void;
}

export const ChallengeList = ({
  challenges,
  loading,
  refreshing,
  error,
  onRefresh,
  onRetry
}: ChallengeListProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: '#4A7C59',
          bgColor: 'bg-craftopia-success/10',
          borderColor: 'border-craftopia-success/30',
          label: 'Completed',
        };
      case 'pending_verification':
        return {
          icon: HourglassIcon,
          color: '#D4A96A',
          bgColor: 'bg-craftopia-accent/10',
          borderColor: 'border-craftopia-accent/30',
          label: 'Pending Review',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: '#DC2626',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          label: 'Rejected',
        };
      default:
        return {
          icon: Clock,
          color: '#5D6B5D',
          bgColor: 'bg-craftopia-primary/10',
          borderColor: 'border-craftopia-light/50',
          label: 'In Progress',
        };
    }
  };

  const handleChallengePress = (challenge: Challenge) => {
    console.log('🎯 Challenge pressed:', {
      user_challenge_id: challenge.id,
      challenge_id: challenge.challenge_id,
      title: challenge.title
    });

    navigation.navigate('QuestDetails', { 
      questId: challenge.challenge_id 
    });
  };

  if (loading && !refreshing) {
    return (
      <View className="mx-4 mb-6">
        {/* Section Header Skeleton */}
        <View className="flex-row items-center justify-between mb-3 mt-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-light mr-2" />
            <View>
              <View className="w-24 h-4 bg-craftopia-light rounded mb-1" />
              <View className="w-32 h-3 bg-craftopia-light rounded" />
            </View>
          </View>
        </View>

        {/* Challenge Item Skeletons */}
        {[1, 2, 3].map((item) => (
          <View 
            key={item} 
            className="bg-craftopia-surface rounded-xl p-3 mb-2 border border-craftopia-light/50"
          >
            <View className="flex-row items-center mb-2">
              <View className="w-14 h-5 bg-craftopia-light rounded mr-2" />
              <View className="w-12 h-5 bg-craftopia-light rounded" />
            </View>
            <View className="w-3/4 h-4 bg-craftopia-light rounded mb-2" />
            <View className="w-full h-3 bg-craftopia-light rounded mb-2" />
            <View className="flex-row justify-between items-center pt-2 border-t border-craftopia-light/30">
              <View className="w-24 h-3 bg-craftopia-light rounded" />
              <View className="w-20 h-3 bg-craftopia-light rounded" />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="mx-4 mb-6 mt-3">
        <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light/50">
          <View className="w-12 h-12 rounded-full bg-red-500/10 items-center justify-center mb-3">
            <Trophy size={20} color="#DC2626" />
          </View>
          <Text className="text-base font-semibold text-craftopia-textPrimary mb-1">
            Failed to Load Challenges
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
      <View className="mx-4 mb-6 mt-3">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
              <Trophy size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Your Challenges
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                Track your quest progress
              </Text>
            </View>
          </View>
        </View>
        
        <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light/50">
          <View className="w-12 h-12 rounded-full bg-craftopia-light/50 items-center justify-center mb-3">
            <Trophy size={20} color="#5D6B5D" />
          </View>
          <Text className="text-base font-semibold text-craftopia-textPrimary mb-1">
            No Challenges Yet
          </Text>
          <Text className="text-xs text-craftopia-textSecondary text-center mb-3">
            Join a quest to start your journey!
          </Text>
        </View>
      </View>
    );
  }

  const ChallengeItem = ({ challenge }: { challenge: Challenge }) => {
    const statusConfig = getStatusConfig(challenge.status);
    const StatusIcon = statusConfig.icon;

    return (
      <TouchableOpacity
        className={`bg-craftopia-surface rounded-xl p-3 mb-2 border ${statusConfig.borderColor}`}
        onPress={() => handleChallengePress(challenge)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View className="flex-row items-center justify-between mb-2">
          <View className={`flex-row items-center px-2 py-1 rounded-lg ${statusConfig.bgColor}`}>
            <StatusIcon size={14} color={statusConfig.color} />
            <Text 
              className="text-xs font-medium uppercase tracking-wide ml-1"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </Text>
          </View>

          {challenge.points && challenge.points > 0 && (
            <View className="px-2 py-1 rounded-lg bg-craftopia-primary/10">
              <Text className="text-xs font-bold text-craftopia-primary">
                +{challenge.points}
              </Text>
            </View>
          )}
        </View>

        {/* Challenge Info */}
        <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1">
          {challenge.title}
        </Text>
        <Text className="text-xs text-craftopia-textSecondary mb-2" numberOfLines={2}>
          {challenge.description || 'Continue working on this challenge'}
        </Text>

        {/* Footer */}
        <View className="flex-row justify-between items-center pt-2 border-t border-craftopia-light/30">
          {challenge.completedAt && (
            <Text className="text-xs text-craftopia-textSecondary">
              📅 {new Date(challenge.completedAt).toLocaleDateString()}
            </Text>
          )}
          {!challenge.completedAt && challenge.status === 'in_progress' && (
            <Text className="text-xs text-craftopia-textSecondary">
              ⏱️ Keep going!
            </Text>
          )}

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
      <View className="mx-4 mb-6 mt-3">
        {/* Section Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
              <Trophy size={18} color="#D4A96A" />
            </View>
            <View>
              <Text className="text-lg font-bold text-craftopia-textPrimary">
                Your Challenges
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Challenge Items */}
        <View>
          {challenges.map((challenge) => (
            <ChallengeItem key={challenge.id} challenge={challenge} />
          ))}
        </View>

        {/* Stats Card */}
        <View className="bg-craftopia-light rounded-xl p-3 mt-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-medium text-craftopia-textPrimary">
              Total Progress
            </Text>
            <Text className="text-xs font-semibold text-craftopia-primary">
              {challenges.filter(c => c.status === 'completed').length}/{challenges.length} Completed
            </Text>
          </View>
          <View className="w-full h-1.5 bg-craftopia-surface rounded-full overflow-hidden mt-1.5">
            <View 
              className="h-full bg-craftopia-primary rounded-full"
              style={{ 
                width: `${(challenges.filter(c => c.status === 'completed').length / challenges.length) * 100}%` 
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};