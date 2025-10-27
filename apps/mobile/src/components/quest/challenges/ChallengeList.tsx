// apps/mobile/src/components/quest/challenges/ChallengeList.tsx - UPDATED COLORS
import React from 'react';
import { FlatList, View, Text, Animated, Easing, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';
import { CheckCircle, Clock, AlertCircle, PlayCircle, ArrowRight, Award } from 'lucide-react-native';

interface Challenge {
  id: number | string;
  challenge_id?: number;
  title: string;
  description: string;
  completedAt?: string;
  points?: number;
  status?: string;
}

interface ChallengeListProps {
  challenges: Challenge[];
  loading: boolean;
  error?: string | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  onRetry?: () => void;
}

const SkeletonItem: React.FC = () => {
  const shimmer = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F2F4F3', '#E8EAE9'],
  });

  return (
    <View className="mx-4 my-2 bg-craftopia-surface rounded-2xl p-4 border border-craftopia-light">
      <View className="flex-row items-start justify-between mb-3">
        <Animated.View style={{ height: 16, width: '70%', borderRadius: 8, backgroundColor }} />
        <Animated.View style={{ height: 24, width: 80, borderRadius: 12, backgroundColor }} />
      </View>
      <Animated.View style={{ height: 12, width: '90%', borderRadius: 6, backgroundColor, marginBottom: 8 }} />
      <Animated.View style={{ height: 12, width: '60%', borderRadius: 6, backgroundColor }} />
    </View>
  );
};

const StatusIcon: React.FC<{ status?: string }> = ({ status }) => {
  const iconProps = { size: 16 };
  
  switch (status) {
    case 'completed':
      return <CheckCircle {...iconProps} color="#4A7C59" />; // craftopia-success
    case 'pending_verification':
      return <Clock {...iconProps} color="#B68D40" />; // craftopia-warning
    case 'rejected':
      return <AlertCircle {...iconProps} color="#8B4513" />; // craftopia-error
    case 'in_progress':
      return <PlayCircle {...iconProps} color="#5D8AA8" />; // craftopia-info
    default:
      return <Award {...iconProps} color="#6B8E6B" />; // craftopia-secondary
  }
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'bg-craftopia-success/20 border-craftopia-success/30', 
          text: 'text-craftopia-success', 
          label: 'COMPLETED' 
        };
      case 'pending_verification':
        return { 
          color: 'bg-craftopia-warning/20 border-craftopia-warning/30', 
          text: 'text-craftopia-warning', 
          label: 'PENDING' 
        };
      case 'rejected':
        return { 
          color: 'bg-craftopia-error/20 border-craftopia-error/30', 
          text: 'text-craftopia-error', 
          label: 'REJECTED' 
        };
      case 'in_progress':
        return { 
          color: 'bg-craftopia-info/20 border-craftopia-info/30', 
          text: 'text-craftopia-info', 
          label: 'IN PROGRESS' 
        };
      default:
        return { 
          color: 'bg-craftopia-light border-craftopia-light', 
          text: 'text-craftopia-textSecondary', 
          label: 'UNKNOWN' 
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View className={`flex-row items-center px-2.5 py-1 rounded-full border ${config.color}`}>
      <View className="mr-1.5">
        <StatusIcon status={status} />
      </View>
      <Text className={`text-xs font-semibold ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
};

export const ChallengeList: React.FC<ChallengeListProps> = ({ 
  challenges, 
  loading, 
  error,
  refreshing = false,
  onRefresh,
  onRetry
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();

  const renderItem = ({ item }: { item: Challenge }) => {
    const challengeId = item.challenge_id || Number(item.id);
    
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('QuestDetails', { questId: challengeId });
        }}
        activeOpacity={0.7}
        className="mx-4 my-2 bg-craftopia-surface rounded-2xl p-4 border border-craftopia-light"
      >
        {/* Header with title and status */}
        <View className="flex-row items-start justify-between mb-3">
          <Text className="text-lg font-bold text-craftopia-textPrimary flex-1 mr-3" numberOfLines={2}>
            {item.title}
          </Text>
          <StatusBadge status={item.status} />
        </View>

        {/* Description */}
        <Text className="text-sm text-craftopia-textSecondary mb-4 leading-5" numberOfLines={2}>
          {item.description}
        </Text>

        {/* Footer with points and date */}
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            {item.points && (
              <>
                <View className="mr-1">
                  <Award size={16} color="#4A7C59" />
                </View>
                <Text className="text-sm font-bold text-craftopia-success">
                  {item.points} pts
                </Text>
              </>
            )}
          </View>
          
          <View className="flex-row items-center">
            {item.completedAt && (
              <Text className="text-xs text-craftopia-textSecondary mr-2">
                {new Date(item.completedAt).toLocaleDateString()}
              </Text>
            )}
            <View className="w-6 h-6 items-center justify-center rounded-full bg-craftopia-light">
              <ArrowRight size={14} color="#5D6B5D" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state with modern skeletons
  if (loading && challenges.length === 0) {
    return (
      <FlatList
        data={Array.from({ length: 3 })}
        keyExtractor={(_, index) => `skeleton-${index}`}
        renderItem={() => <SkeletonItem />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#374A36']}
              tintColor="#374A36"
            />
          ) : undefined
        }
      />
    );
  }

  // Modern error state
  if (error && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="mb-4">
          <AlertCircle size={48} color="#8B4513" />
        </View>
        <Text className="text-xl font-bold text-craftopia-textPrimary text-center mb-2">
          Oops! Something went wrong
        </Text>
        <Text className="text-base text-craftopia-textSecondary text-center mb-6">
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity 
            onPress={onRetry} 
            className="bg-craftopia-primary px-6 py-3 rounded-xl"
            activeOpacity={0.7}
          >
            <Text className="text-craftopia-surface text-base font-semibold">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Modern empty state
  if (!loading && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="mb-4">
          <Award size={48} color="#6B8E6B" />
        </View>
        <Text className="text-xl font-bold text-craftopia-textPrimary text-center mb-2">
          No challenges yet
        </Text>
        <Text className="text-base text-craftopia-textSecondary text-center mb-6">
          Start your first challenge to earn rewards and make an impact
        </Text>
        {onRefresh && (
          <TouchableOpacity 
            onPress={onRefresh} 
            className="bg-craftopia-primary px-6 py-3 rounded-xl"
            activeOpacity={0.7}
          >
            <Text className="text-craftopia-surface text-base font-semibold">Explore Challenges</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Main list with modern styling
  return (
    <FlatList
      data={challenges}
      keyExtractor={(item, index) => {
        const key = item.id ? item.id.toString() : `challenge-${index}`;
        return key;
      }}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ 
        paddingVertical: 8,
        flexGrow: 1 
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#374A36']}
            tintColor="#374A36"
          />
        ) : undefined
      }
    />
  );
};