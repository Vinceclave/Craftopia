// apps/mobile/src/components/quest/challenges/ChallengeList.tsx
import React from 'react';
import { FlatList, View, Text, Animated, Easing, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';
import Button from '~/components/common/Button';

interface Challenge {
  id: number | string;
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
    <View className="px-4 py-3 border-b border-craftopia-light bg-craftopia-surface">
      <Animated.View style={{ height: 16, width: '60%', borderRadius: 4, backgroundColor, marginBottom: 8 }} />
      <Animated.View style={{ height: 12, width: '90%', borderRadius: 4, backgroundColor, marginBottom: 4 }} />
      <Animated.View style={{ height: 12, width: '70%', borderRadius: 4, backgroundColor, marginBottom: 8 }} />
      <Animated.View style={{ height: 24, width: '40%', borderRadius: 12, backgroundColor }} />
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-craftopia-primary';
      case 'pending_verification':
        return 'text-craftopia-accent';
      case 'rejected':
        return 'text-red-500';
      case 'in_progress':
        return 'text-blue-500';
      default:
        return 'text-craftopia-textSecondary';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'pending_verification':
        return 'PENDING';
      case 'in_progress':
        return 'IN PROGRESS';
      default:
        return status?.replace('_', ' ').toUpperCase() || '';
    }
  };

  const renderItem = ({ item }: { item: Challenge }) => (
    <View className="px-4 py-3 border-b border-craftopia-light bg-craftopia-surface">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-sm font-semibold text-craftopia-textPrimary flex-1 mr-2">
          {item.title}
        </Text>
        {item.status && (
          <View className="px-2 py-1 rounded-full bg-craftopia-light">
            <Text className={`text-xs font-medium ${getStatusColor(item.status)}`}>
              {getStatusText(item.status)}
            </Text>
          </View>
        )}
      </View>
      
      <Text className="text-xs text-craftopia-textSecondary mb-2 leading-relaxed">
        {item.description}
      </Text>
      
      <View className="flex-row justify-between items-center mb-2">
        {item.points && (
          <Text className="text-xs font-medium text-craftopia-primary">
            {item.points} points
          </Text>
        )}
        {item.completedAt && (
          <Text className="text-xs text-craftopia-textSecondary">
            Completed: {new Date(item.completedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      
      <Button
        title="View Details"
        size="md"
        className="mt-1"
        onPress={() => navigation.navigate('QuestDetails', { questId: Number(item.id) })}
      />
    </View>
  );

  // Loading state with skeletons
  if (loading && challenges.length === 0) {
    return (
      <FlatList
        data={Array.from({ length: 3 })}
        keyExtractor={(_, index) => `skeleton-${index}`}
        renderItem={() => <SkeletonItem />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#004E98']}
            />
          ) : undefined
        }
      />
    );
  }

  // Error state
  if (error && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-6 px-4">
        <Text className="text-craftopia-textPrimary text-base font-semibold text-center mb-1">
          Something went wrong
        </Text>
        <Text className="text-craftopia-textSecondary text-sm text-center mb-4">
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} className="bg-craftopia-primary px-4 py-2 rounded-lg">
            <Text className="text-craftopia-surface text-sm font-medium">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Empty state
  if (!loading && challenges.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-6 px-4">
        <Text className="text-craftopia-textPrimary text-base font-semibold mb-1">
          No challenges found
        </Text>
        <Text className="text-craftopia-textSecondary text-sm text-center mb-4">
          You haven't joined any challenges in this category yet
        </Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} className="bg-craftopia-primary px-4 py-2 rounded-lg">
            <Text className="text-craftopia-surface text-sm font-medium">Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Main list
  return (
    <FlatList
      data={challenges}
      keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#004E98']}
          />
        ) : undefined
      }
      contentContainerStyle={{ 
        paddingBottom: 80,
        flexGrow: 1 
      }}
    />
  );
};